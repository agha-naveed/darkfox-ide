const { contextBridge, ipcRenderer } = require("electron");
const { Titlebar } = require("custom-electron-titlebar");

contextBridge.exposeInMainWorld("api", {
  openFolder: () => ipcRenderer.invoke("open-folder"),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke("save-file", { filePath, content }),
  createFile: (dirPath, name) => ipcRenderer.invoke("create-new-file", { dirPath, name }),
  saveFileAs: (content) => ipcRenderer.invoke('save-file-as', content),
});

window.addEventListener('DOMContentLoaded', () => {
  // Title bar implementation
  new Titlebar({
    backgroundColor: '#202020',
    icon: 'path/to/icon.png',
    menu: yourElectronMenu,
  });
});