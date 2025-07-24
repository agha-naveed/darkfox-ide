import { useState, useEffect } from "react";
import FileExplorer from "./components/FileExplorer";
import CodeEditor from "./components/CodeEditor";
import StatusBar from "./components/StatusBar";
const { ipcRenderer } = window.require("electron");

export default function App() {
  const [tree, setTree] = useState([]);
  const [openFiles, setOpenFiles] = useState([]); // open tabs
  const [activeFile, setActiveFile] = useState(null); // active tab
  const [fileContent, setFileContent] = useState(""); // editor content
  const [editorInstance, setEditorInstance] = useState(null);

  const openFolder = async () => {
    const result = await ipcRenderer.invoke('open-folder');
    if (result)   setTree(result.tree);

    console.log(result);
  };


  // Open a file
  const openFile = async (filePath) => {
    console.log("Opening file:", filePath); // Debug
    const content = await ipcRenderer.invoke("read-file", filePath);
    console.log("File content:", content); // Debug

    const name = filePath.split(/[/\\]/).pop();

    // Prevent duplicate tabs
    const existing = openFiles.find(f => f.path === filePath);
    if (existing) {
      setActiveFile(existing);
      setFileContent(content);
      return;
    }

    const newTab = { name, path: filePath, saved: true };
    setOpenFiles(prev => [...prev, newTab]);
    setActiveFile(newTab);
    setFileContent(content);
  };



  // Switch tab
  const switchTab = async (file) => {
    setActiveFile(file);
    if (file.path) {
      const content = await ipcRenderer.invoke("read-file", file.path);
      setFileContent(content);
    }
  };

  // Close tab
  const closeTab = (file) => {
    const newTabs = openFiles.filter((f) => f !== file);

    // If the closed tab was active → switch to another
    if (activeFile?.name === file.name) {
      if (newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        setActiveFile(lastTab);
        switchTab(lastTab);
      } else {
        setActiveFile(null);
        setFileContent("");
      }
    }

    setOpenFiles(newTabs);
  };

  // Create new file
  const newFile = () => {
    const name = `Untitled-${openFiles.length + 1}.txt`;
    const newTab = { name, handle: null, saved: false };
    setOpenFiles((prev) => [...prev, newTab]);
    setActiveFile(newTab);
    setFileContent("");
  };

  // Save file
  const saveFile = async (content) => {
    if (!activeFile) return;

    let handle = activeFile.handle;
    if (!handle) {
      handle = await window.showSaveFilePicker({
        suggestedName: activeFile.name,
        types: [{ description: "Text File", accept: { "text/plain": [".txt"] } }],
      });
      activeFile.handle = handle;
    }

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();

    // Mark as saved
    setOpenFiles((prev) =>
      prev.map((f) => (f.name === activeFile.name ? { ...f, saved: true } : f))
    );
  };

  // Cycle tabs with Ctrl+Tab
  const cycleTab = (forward = true) => {
    if (openFiles.length === 0) return;
    const currentIndex = openFiles.findIndex((f) => f.name === activeFile?.name);
    let nextIndex = forward
      ? (currentIndex + 1) % openFiles.length
      : (currentIndex - 1 + openFiles.length) % openFiles.length;
    switchTab(openFiles[nextIndex]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        cycleTab(!e.shiftKey);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (activeFile) closeTab(activeFile);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newFile();
      }
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeFile) saveFile(fileContent);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openFiles, activeFile, fileContent]);

  // Get language based on file extension
  const getLanguageFromExtension = (name) => {
    if (!name) return "plaintext";
  const ext = name.includes('.') ? name.split(".").pop() : "";
  // ... rest remains the same
    switch (ext) {
      case "js":
      case "mjs":
      case "jsx": return "javascript";
      case "ts":
      case "tsx": return "typescript";
      case "html": return "html";
      case "css": return "css";
      case "json": return "json";
      case "py": return "python";
      case "ru": return "ruby";
      case "rs":  return "rust";
      case "java": return "java";
      case "c": return "c";
      case "cpp": return "cpp";
      case "md": return "markdown";
      default: return "plaintext";
    }
  };


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 text-white p-2">
        <button
          onClick={openFolder}
          className="w-full bg-blue-600 py-[6px] cursor-pointer transition-all hover:bg-blue-800 rounded mb-2"
        >
          Open Folder
        </button>
        {/* <FileExplorer tree={tree} onFileClick={openFile} /> */}
        <FileExplorer tree={tree} onFileClick={openFile} refreshTree={() => buildTreeAgain()} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col bg-zinc-800">
        {/* Tabs */}
        <div className="flex bg-gray-900 text-white border-b border-gray-700">
          {openFiles.map((file) => (
            <div
              key={file.name}
              className={`px-3 py-1 cursor-pointer flex items-center ${
                file.name === activeFile?.name ? "bg-gray-700" : "bg-gray-800"
              }`}
              onClick={() => switchTab(file)}
            >
              <span className="mr-2">{file.name}{!file.saved && " *"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(file);
                }}
                className="ml-2 text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {/* <TabBar
          openFiles={openFiles}
          activeFile={activeFile}
          onSwitch={switchTab}
          onClose={closeTab}
          onCloseOthers={(file) => setOpenFiles(openFiles.filter(f => f.name === file.name))}
          onCloseAll={() => { setOpenFiles([]); setActiveFile(null); setFileContent(""); }}
        /> */}

        {/* Editor */}
        {activeFile ? (
          <CodeEditor
            content={fileContent}
            setEditorInstance={setEditorInstance}
            setContent={(val) => {
              setFileContent(val);
              setOpenFiles((prev) =>
                prev.map((f) =>
                  f.name === activeFile.name ? { ...f, saved: false } : f
                )
              );
            }}
            onSave={() => ipcRenderer.invoke("save-file", { filePath: activeFile.path, content: fileContent })}
            language={getLanguageFromExtension(activeFile?.name)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Open a file to start editing
          </div>
        )}
        <StatusBar
          fileName={activeFile?.name}
          language={activeFile ? activeFile.name.split(".").pop() : "plaintext"}
          editor={editorInstance}
        />
      </div>
    </div>
  );
}

// Build folder tree
async function buildTree(dirHandle, parent = null) {
  const result = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === "directory") {
      const children = await buildTree(entry, entry);
      result.push({
        name: entry.name,
        kind: entry.kind,
        handle: Object.assign(entry, { _parent: dirHandle }),
        children,
      });
    } else {
      result.push({
        name: entry.name,
        kind: entry.kind,
        handle: Object.assign(entry, { _parent: dirHandle }),
      });
    }
  }
  return result;
}

