import { useState } from "react";
import FileExplorer from "./components/FileExplorer";
import CodeEditor from "./components/CodeEditor";

const { ipcRenderer } = window.require("electron");

export default function App() {
  const [tree, setTree] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  // === Load folder tree ===
  const openFolder = async () => {
    const result = await ipcRenderer.invoke("open-folder");
    if (!result) return;
    setTree(result.tree);
  };

  // === Refresh tree (after create/rename/delete) ===
  const refreshTree = async () => {
    const result = await ipcRenderer.invoke("open-folder");
    if (result) setTree(result.tree);
  };

  // === Open file ===
  const openFile = async (filePath) => {
    const content = await ipcRenderer.invoke("read-file", filePath);
    const name = filePath.split(/[/\\]/).pop();

    // If already open → switch to it
    const existingTab = openFiles.find((f) => f.path === filePath);
    if (existingTab) {
      setActiveFile(existingTab);
      setFileContent(content);
      return;
    }

    // Otherwise add a new tab
    const newTab = { name, path: filePath, saved: true };
    setOpenFiles((prev) => [...prev, newTab]);
    setActiveFile(newTab);
    setFileContent(content);
  };

  // === Save file ===
  const saveFile = async () => {
    if (!activeFile) return;
    await ipcRenderer.invoke("save-file", { filePath: activeFile.path, content: fileContent });
    setOpenFiles((prev) =>
      prev.map((f) => (f.path === activeFile.path ? { ...f, saved: true } : f))
    );
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-700 p-2">
        <button
          onClick={openFolder}
          className="w-full bg-blue-600 p-2 rounded mb-2 hover:bg-blue-500"
        >
          Open Folder
        </button>
        <FileExplorer tree={tree} onFileClick={openFile} refreshTree={refreshTree} />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {activeFile ? (
          <>
            {/* Tabs */}
            <div className="p-2 bg-gray-800 border-b border-gray-700 flex justify-between">
              <span>{activeFile.name}</span>
              <button
                onClick={saveFile}
                className="bg-green-600 px-3 py-1 rounded hover:bg-green-500"
              >
                Save
              </button>
            </div>

            {/* Monaco Editor */}
            <CodeEditor
              content={fileContent}
              setContent={(val) => {
                setFileContent(val);
                setOpenFiles((prev) =>
                  prev.map((f) =>
                    f.path === activeFile.path ? { ...f, saved: false } : f
                  )
                );
              }}
              language={activeFile.name.split(".").pop()}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Open a file to start editing
          </div>
        )}
      </div>
    </div>
  );
}
