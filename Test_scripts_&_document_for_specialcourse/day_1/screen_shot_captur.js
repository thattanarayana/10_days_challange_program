const { app, BrowserWindow, desktopCapturer } = require('electron');
const path = require('path');
const fs = require('fs');

const captureFolder = path.join(__dirname, 'src_capture');

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,   // simple, less secure
            contextIsolation: false
        }
    });

    win.loadFile(path.join(__dirname, 'index.html'));

    // After page loads, start screenshot process
    win.webContents.on('did-finish-load', async () => {
        let message = "";

        try {
            // make sure folder exists
            if (!fs.existsSync(captureFolder)) {
                fs.mkdirSync(captureFolder);
            }

            const sources = await desktopCapturer.getSources({ types: ['screen'] });

            if (sources.length === 0) {
                message = "No screen sources found!";
            } else {
                const screenshots = [];
                for (let i = 1; i <= 5; i++) {
                    const screenshot = sources[0].thumbnail.toPNG();
                    const filePath = path.join(captureFolder, `screenshot-${i}.png`);
                    fs.writeFileSync(filePath, screenshot);
                    screenshots.push(filePath);
                }
                message = `Captured 5 screenshots:\n` + screenshots.join("\n");
            }
        } catch (err) {
            message = "Error: " + err.message;
        }

        win.webContents.send("capture-result", message);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
