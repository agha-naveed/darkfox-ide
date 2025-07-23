import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFolder, FaFolderOpen, FaFileCode } from "react-icons/fa";

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
      if (contextMenu?.node.kind !== "directory") return;
      const newHandle = await contextMenu.node.handle.getFileHandle(
        `NewFile-${Date.now()}.txt`,
        { create: true }
      );
      await refreshTree();
    } catch (err) {
      console.error("New file error:", err);
    }
    setContextMenu(null);
  };

  const handleNewFolder = async () => {
    try {
      if (contextMenu?.node.kind !== "directory") return;
      await contextMenu.node.handle.getDirectoryHandle(`NewFolder-${Date.now()}`, {
        create: true,
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

      const parentDir = contextMenu.node.handle._parent;
      if (!parentDir) return alert("Rename not supported for this handle.");

      // Get file data
      const file = await contextMenu.node.handle.getFile();
      const newHandle = await parentDir.getFileHandle(newName, { create: true });

      // Copy content
      const writable = await newHandle.createWritable();
      await writable.write(await file.text());
      await writable.close();

      // Delete old file
      await parentDir.removeEntry(contextMenu.node.name);

      await refreshTree();
    } catch (err) {
      console.error("Rename error:", err);
    }
    setContextMenu(null);
  };

  const handleDelete = async () => {
    try {
      const confirmed = confirm(`Delete "${contextMenu.node.name}"?`);
      if (!confirmed) return;

      const parentDir = contextMenu.node.handle._parent;
      if (!parentDir) return alert("Delete not supported for this handle.");

      await parentDir.removeEntry(contextMenu.node.name, { recursive: true });
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
            key={path}
            onContextMenu={(e) => handleContextMenu(e, node)}
            className="ml-4 flex items-center gap-2 cursor-pointer hover:bg-gray-700 px-1 py-0.5 rounded text-sm truncate"
            onClick={() => onFileClick(node.handle)}
          >
            <FaFileCode className="text-blue-400" />
            {node.name}
          </div>
        );
      }

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
      
      return (
        <div key={path} className="ml-2">
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

      {/* Context Menu (Overlay) */}
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
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer" onClick={handleNewFile}>New File</div>
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer" onClick={handleNewFolder}>New Folder</div>
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer" onClick={handleRename}>Rename</div>
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer text-red-400" onClick={handleDelete}>Delete</div>
        </div>
      )}
    </>
  );
}
