import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFolder, FaFolderOpen, FaFileCode } from "react-icons/fa";
// import { ipcRenderer } from "electron";

// const { ipcRenderer } = window.require("electron");
// import { ipcRenderer } from "electron";
// const ipcRenderer = window.api

export default function FileExplorer({ tree, onFileClick, refreshTree }) {
  const [expanded, setExpanded] = useState({});
  const [contextMenu, setContextMenu] = useState(null);

  const toggle = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleContextMenu = (e, node) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  // === Menu Actions ===
  const handleNewFile = async () => {
    try {
      const newPath = window.Electron.path.join(
        contextMenu.node.path,
        `NewFile-${Date.now()}.txt`
      );
      // await window.Electron.fs.writeFile(newPath, '');
      await window.api.saveFile(`${contextMenu.node.path}/NewFile-${Date.now()}.txt`, "");
      refreshTree();
    } catch (err) {
      console.error("New file error:", err);
    }
    setContextMenu(null);
  };

  const handleNewFolder = async () => {
    try {
      if (contextMenu?.node.kind !== "directory") return;
      await ipcRenderer.invoke("create-new-folder", {
        dirPath: contextMenu.node.path,
        name: `NewFolder-${Date.now()}`,
      });
      await refreshTree();
    } catch (err) {
      console.error("New folder error:", err);
    }
    setContextMenu(null);
  };

  const handleRename = async () => {
    try {
      const newName = prompt("Enter new name:", contextMenu.node.name);
      if (!newName || newName === contextMenu.node.name) return;
      await ipcRenderer.invoke("rename-entry", {
        oldPath: contextMenu.node.path,
        newName,
      });
      await refreshTree();
    } catch (err) {
      console.error("Rename error:", err);
    }
    setContextMenu(null);
  };

  const handleDelete = async () => {
    try {
      const confirmed = confirm(Delete `${contextMenu.node.name}?`);
      if (!confirmed) return;
      await ipcRenderer.invoke("delete-entry", contextMenu.node.path);
      await refreshTree();
    } catch (err) {
      console.error("Delete error:", err);
    }
    setContextMenu(null);
  };

  const renderTree = (nodes, parentPath = "") =>
    nodes.map((node) => {
      const path = `${parentPath}/${node.name}`;
      const isOpen = expanded[path] ?? false;

      if (node.kind === "file") {
        return (
          <div
            key={node.path}
            onClick={() => {onFileClick(node.path); console.log(node.path)}}
            onContextMenu={(e) => handleContextMenu(e, node)}
            className="ml-4 flex items-center gap-2 cursor-pointer hover:bg-gray-700 px-1 py-0.5 rounded text-sm truncate"
          >
            <FaFileCode className="text-blue-400" />
            {node.name}
          </div>
        );
      }

      return (
        <div key={node.path} className="ml-2">
          <div
            onContextMenu={(e) => handleContextMenu(e, node)}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 px-1 py-0.5 rounded text-sm truncate"
            onClick={() => toggle(path)}
          >
            {isOpen ? (
              <FaFolderOpen className="text-yellow-400" />
            ) : (
              <FaFolder className="text-yellow-500" />
            )}
            {node.name}
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="ml-4"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTree(node.children || [], path)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });

  return (
    <>
      {/* Sidebar content */}
      <div className="overflow-y-auto h-full pr-1 custom-scroll relative">
        {renderTree(tree)}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            minWidth: "150px",
          }}
          className="bg-gray-800 text-white rounded shadow-lg p-2 w-40 z-[99999]"
          onMouseLeave={() => setContextMenu(null)}
        >
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer" onClick={handleNewFile}>
            New File
          </div>
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer" onClick={handleNewFolder}>
            New Folder
          </div>
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer" onClick={handleRename}>
            Rename
          </div>
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer text-red-400" onClick={handleDelete}>
            Delete
          </div>
        </div>
      )}
    </>
  );
}