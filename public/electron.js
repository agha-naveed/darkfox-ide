const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // win.loadURL(`file://${path.join(__dirname, "../build/index.html")}`);
  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    win.loadFile(path.join(__dirname, "../ide-interface/dist/index.html"));
  }
}

app.whenReady().then(createWindow);