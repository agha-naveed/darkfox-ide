const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // for simplicity
      // preload: path.join(__dirname, "preload.js"),
      // preload: path.join(app.getAppPath(), "public", "preload.js")

    },
  });

  mainWindow.loadURL(
    app.isPackaged
      ? `file://${path.join(__dirname, "../dist/index.html")}`
      : "http://localhost:5173"
  );

  if (!app.isPackaged) mainWindow.webContents.openDevTools();
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


// ===================
// IPC: Folder & File
// ===================
ipcMain.handle("open-folder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled) return null;
  const folderPath = result.filePaths[0];

  function buildTree(dirPath) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    return items.map((item) => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        return {
          name: item.name,
          kind: "directory",
          path: fullPath,
          children: buildTree(fullPath),
        };
      }
      return { name: item.name, kind: "file", path: fullPath };
    });
  }

  return { tree: buildTree(folderPath), rootPath: folderPath };
});

// Read File
ipcMain.handle("read-file", async (_, filePath) => {
  return fs.readFileSync(filePath, "utf8");
});

// Save File
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