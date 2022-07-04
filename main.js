const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow} = electron;
let { ipcMain } = electron;
let mainWindow;
let splash;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        icon:  './images/logo.png',
        show: false 
    });
    // mainWindow.removeMenu();
    splash = new BrowserWindow({
        width: 320, 
        height: 320, 
        frame: false, 
        transparent: true,
        icon:  './images/logo.png',
        alwaysOnTop: true
    });
    splash.loadURL(`file://${__dirname}/SplashScreen.html`);
    mainWindow.loadURL(`file://${__dirname}/LockScreen.html`);
    splash.show();
    mainWindow.once('ready-to-show', () => {
        splash.destroy();
        mainWindow.maximize();
        mainWindow.show();
    });
});
ipcMain.on('newWindow', function (e, fileName) {
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, fileName),
        protocol: 'file:',
        slashes: true
    }));
});

// ipcMain.on('setCookies', function (e, name,value) {
//     const { session } = require('electron')
//     const cookie = { url: 'http://www.github.com', name: name, value: value }
//     session.defaultSession.cookies.set(cookie)
//     .then(() => {
//         // success
//     }, (error) => {
//         console.error(error)
//     })
// });
// ipcMain.on('getCookies', function (e, name) {
//     const { session } = require('electron')
//       session.defaultSession.cookies.get({ url: 'http://www.github.com',name: name })
//     .then((cookies) => {
//         e.sender.send('cookiesReply', cookies[0].value);
//     }).catch((error) => {
//         console.log(error)
//     })
// });