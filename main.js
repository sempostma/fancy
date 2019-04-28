const { app, BrowserWindow, protocol, ipcMain } = require('electron')
const path = require('path');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
autoUpdater.checkForUpdatesAndNotify()

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

ipcMain.on('imagemin-buffer', async (event, arg) => {
    const { uint8array, id, quality} = arg;
    const buffer = Buffer.from(uint8array);
    const data = await imagemin.buffer(buffer, null, {
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: quality || 1
            })
        ]
    });
    event.sender.send('imagemin-buffer-response', { id, uint8array: new Uint8Array(data) });
})


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'public/icon.png'),
        show: false,
        frame: false,
        backgroundColor: '#4a3546',
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.setMenu(null);
    win.maximize();
    win.show();

    // and load the index.html of the app.
    win.loadFile('build/index.html');

    // Open the DevTools.
    // win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.