const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  openFolder: () => ipcRenderer.invoke("open-folder"),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke("save-file", { filePath, content }),
  createFile: (dirPath, name) => ipcRenderer.invoke("create-new-file", { dirPath, name }),
  saveFileAs: (content) => ipcRenderer.invoke('save-file-as', content),
});
