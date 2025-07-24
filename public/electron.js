const { app, BrowserWindow, ipcMain, dialog, protocol } = require("electron");
// const path = require("path");
// const fs = require("fs");
const path = require('path');
const fs = require('fs').promises;


let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,   // Allow window.require in React
      contextIsolation: false,
      // webSecurity: false
    },
  });

  
  const isDev = !app.isPackaged;
  mainWindow.loadURL(
    isDev
      ? "http://localhost:5173"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  );

  mainWindow.webContents.openDevTools();
  
  mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.executeJavaScript(`
        window.Electron = {
          ipcRenderer: require('electron').ipcRenderer,
          fs: require('fs').promises,
          path: require('path')
        };
      `);
  });
});

ipcMain.handle("open-folder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled) return null;
  const folderPath = result.filePaths[0];

  function buildTree(dirPath) {
    return fs.readdirSync(dirPath, { withFileTypes: true }).map((item) => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        return { name: item.name, kind: "directory", path: fullPath, children: buildTree(fullPath) };
      }
      return { name: item.name, kind: "file", path: fullPath };
    });
  }
  return { tree: buildTree(folderPath) };
});


  ipcMain.handle('read-file', async (_, filePath) => {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error('Error reading file:', error);
      return '';
    }
  });

  ipcMain.handle('save-file', async (_, { filePath, content }) => {
    try {
      await fs.writeFile(filePath, content);
      return { success: true };
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false };
    }
  });

  ipcMain.handle('create-new-file', async (_, { dirPath, name }) => {
    const fullPath = path.join(dirPath, name);
    await fs.writeFile(fullPath, '');
    return fullPath;
  });

  ipcMain.handle('create-new-folder', async (_, { dirPath, name }) => {
    const fullPath = path.join(dirPath, name);
    await fs.mkdir(fullPath);
    return fullPath;
  });

  ipcMain.handle('rename-entry', async (_, { oldPath, newName }) => {
    const newPath = path.join(path.dirname(oldPath), newName);
    await fs.rename(oldPath, newPath);
    return newPath;
  });

  ipcMain.handle('delete-entry', async (_, pathToDelete) => {
    await fs.rm(pathToDelete, { recursive: true });
    return true;
  });

// contextBridge.exposeInMainWorld('ElectronAPI', {
//   openFolder: () => ipcRenderer.invoke('open-folder'),
//   readFile: (path) => ipcRenderer.invoke('read-file', path),
//   // Only expose specific methods needed
// });


// ipcMain.handle("create-new-file", async (_, { dirPath, name }) => {
//   const filePath = path.join(dirPath, name);
//   fs.writeFileSync(filePath, ""); // empty file
//   return filePath;
// });

// ipcMain.handle("create-new-folder", async (_, { dirPath, name }) => {
//   const folderPath = path.join(dirPath, name);
//   fs.mkdirSync(folderPath);
//   return folderPath;
// });

// ipcMain.handle("rename-entry", async (_, { oldPath, newName }) => {
//   const newPath = path.join(path.dirname(oldPath), newName);
//   fs.renameSync(oldPath, newPath);
//   return newPath;
// });

// ipcMain.handle("delete-entry", async (_, entryPath) => {
//   if (fs.lstatSync(entryPath).isDirectory()) {
//     fs.rmSync(entryPath, { recursive: true, force: true });
//   } else {
//     fs.unlinkSync(entryPath);
//   }
//   return true;
// });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});