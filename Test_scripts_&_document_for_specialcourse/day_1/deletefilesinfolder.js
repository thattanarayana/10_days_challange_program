const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const targetFolder = "C:\\Users\\DELL\\Pictures\\test_project";

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,   // simple, but less secure
            contextIsolation: false
        }
    });

    // Run delete logic before loading page
    let message = "";

    try {
        const files = fs.readdirSync(targetFolder);

        if (files.length === 0) {
            message = "No files found (folder empty).";
        } else {
            for (const file of files) {
                const filePath = path.join(targetFolder, file);
                fs.unlinkSync(filePath);
            }
            message = `Deleted ${files.length} files:\n${files.join("\n")}`;
        }
    } catch (err) {
        message = "Error: " + err.message;
    }

    // Pass the message to HTML
    win.loadFile(path.join(__dirname, 'index.html')).then(() => {
        win.webContents.send("result-message", message);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
