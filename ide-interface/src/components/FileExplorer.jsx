import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFolder, FaFolderOpen, FaFileCode } from "react-icons/fa";

export default function FileExplorer({ tree, onFileClick }) {
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
    <div className="overflow-y-auto h-full pr-1 custom-scroll relative">
      {renderTree(tree)}

      {contextMenu && (
        <div
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          className="absolute bg-gray-800 text-white rounded shadow-lg p-2 w-40 z-50"
          onMouseLeave={() => setContextMenu(null)}
        >
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer">New File</div>
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer">New Folder</div>
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer">Rename</div>
          <div className="px-2 py-1 hover:bg-gray-700 cursor-pointer text-red-400">Delete</div>
        </div>
      )}
    </div>
  );
}
