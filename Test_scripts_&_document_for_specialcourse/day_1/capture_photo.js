const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,   // allow require() in renderer
            contextIsolation: false  // disable isolation so require works
        }
    });

    win.loadFile('src_photo/index.html');

    // Listen for close request from renderer
    ipcMain.on('close-window', () => {
        win.close();
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
