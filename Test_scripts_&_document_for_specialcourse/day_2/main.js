const { app } = require("electron");
const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");

// Firebase
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, set } = require("firebase/database");

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDwu_z1HUQF5FhxYlT7lQsmbEcnAFFTuv8",
    authDomain: "narayana-5506b.firebaseapp.com",
    databaseURL: "https://narayana-5506b-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "narayana-5506b",
    storageBucket: "narayana-5506b.firebasestorage.app",
    messagingSenderId: "299319111569",
    appId: "1:299319111569:web:e31d22bf834c8c1b20f430",
    measurementId: "G-HJDG9X5TME"
};

// Init Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Terminal input setup
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "cmd> "
});

let currentPath = "";

// Normalize Windows paths
function normalizePath(p) {
    if (!p) return "";
    return p.replace(/\\/g, "/"); // G:\foo → G:/foo
}

// Scan folder
async function scanFolder(targetPath) {
    targetPath = normalizePath(targetPath);
    try {
        const exists = await fs.pathExists(targetPath);
        if (!exists) {
            console.log(`⚠️ Path not found: ${targetPath}`);
            await set(ref(database, "result"), `Path not found: ${targetPath}`);
            return;
        }
        const items = await fs.readdir(targetPath);
        console.log(`📂 Contents of ${targetPath}:`);
        items.forEach(i => console.log("   - " + i));
        await set(ref(database, "result"), items);
        currentPath = targetPath;
    } catch (err) {
        console.error("❌ Error:", err.message);
        await set(ref(database, "result"), `Error: ${err.message}`);
    }
}

// Delete / Clear
async function handleDelete(mode) {
    try {
        const exists = await fs.pathExists(currentPath);
        if (!exists) {
            console.log(`⚠️ Path not found: ${currentPath}`);
            await set(ref(database, "result"), `Path not found: ${currentPath}`);
            return;
        }
        if (mode === "delete") {
            await fs.remove(currentPath);
            console.log(`🗑️ Deleted: ${currentPath}`);
            await set(ref(database, "result"), `Deleted: ${currentPath}`);
        } else if (mode === "clear") {
            const stats = await fs.stat(currentPath);
            if (stats.isDirectory()) {
                const files = await fs.readdir(currentPath);
                for (const f of files) {
                    await fs.remove(path.join(currentPath, f));
                }
                console.log(`🧹 Cleared contents of: ${currentPath}`);
                await set(ref(database, "result"), `Cleared contents of: ${currentPath}`);
            } else {
                console.log("⚠️ Cannot clear a file, only folders");
            }
        }
    } catch (err) {
        console.error("❌ Error:", err.message);
        await set(ref(database, "result"), `Error: ${err.message}`);
    }
}

// Firebase listener
function setupFirebaseListener() {
    const commandRef = ref(database, "commandData");
    onValue(commandRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const { command, path: targetPath } = data;
        console.log(`📥 Firebase -> command: ${command}, path: ${targetPath || currentPath}`);

        try {
            if (command.toLowerCase() === "ls") {
                if (targetPath) currentPath = normalizePath(targetPath);
                await scanFolder(currentPath);
            } else if (command.toLowerCase() === "delete") {
                await handleDelete("delete");
            } else if (command.toLowerCase() === "clear") {
                await handleDelete("clear");
            }
        } catch (err) {
            console.error("❌ Firebase Command Error:", err.message);
        }

        await set(commandRef, null); // clear command
    });
}

// Terminal REPL
function setupTerminal() {
    console.log("🚀 File Manager Service Started");
    console.log("📡 Enter commands in terminal OR from Firebase");
    console.log("👉 Format: ls <path> | delete | clear");
    rl.prompt();

    rl.on("line", async (input) => {
        const [cmd, ...args] = input.trim().split(" ");
        if (cmd === "ls") {
            const argPath = args.join(" ");
            if (argPath) currentPath = normalizePath(argPath);
            await scanFolder(currentPath);
        } else if (cmd === "delete") {
            await handleDelete("delete");
        } else if (cmd === "clear") {
            await handleDelete("clear");
        } else if (cmd === "exit") {
            console.log("👋 Exiting File Manager Service");
            process.exit(0);
        } else {
            console.log("⚠️ Unknown command. Use: ls <path>, delete, clear, exit");
        }
        rl.prompt();
    });
}

// Start app (headless)
app.whenReady().then(() => {
    setupFirebaseListener();
    setupTerminal();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
