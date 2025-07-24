const { app, BrowserWindow, ipcMain, dialog, protocol } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,   // Allow window.require in React
      contextIsolation: false,
    },
  });

  app.whenReady().then(() => {
  protocol.interceptFileProtocol('file', (req, cb) => {
    const url = req.url.substr(7); // strip 'file://'
    cb({ path: path.normalize(url) });
  });
});
  const isDev = !app.isPackaged;
  mainWindow.loadURL(
    isDev
      ? "http://localhost:5173"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  );

  mainWindow.webContents.openDevTools();
});

// === Folder picker ===
ipcMain.handle("open-folder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled) return null;
  const folderPath = result.filePaths[0];

  function buildTree(dirPath) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    return items.map((item) => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        return { name: item.name, kind: "directory", path: fullPath, children: buildTree(fullPath) };
      }
      return { name: item.name, kind: "file", path: fullPath };
    });
  }

  return { tree: buildTree(folderPath) };
});

// === Read File ===
ipcMain.handle("read-file", async (_, filePath) => {
  return fs.readFileSync(filePath, "utf8");
});

// === Save File ===
ipcMain.handle("save-file", async (_, { filePath, content }) => {
  fs.writeFileSync(filePath, content, "utf8");
  return true;
});

ipcMain.handle("save-file-as", async (_, content) => {
  const result = await dialog.showSaveDialog({ title: "Save File As" });
  if (result.canceled) return null;
  fs.writeFileSync(result.filePath, content, "utf8");
  return result.filePath;
});


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