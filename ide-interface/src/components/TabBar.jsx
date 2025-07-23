import { useState } from "react";
import ContextMenu from "./ContextMenu";

export default function TabBar({ openFiles, activeFile, onSwitch, onClose, onCloseOthers, onCloseAll }) {
  const [menu, setMenu] = useState(null);

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setMenu({
      x: e.clientX,
      y: e.clientY,
      options: [
        { label: "Close", onClick: () => onClose(file) },
        { label: "Close Others", onClick: () => onCloseOthers(file) },
        { label: "Close All", onClick: () => onCloseAll() }
      ]
    });
  };

  return (
    <div className="flex bg-zinc-900 text-white border-b border-zinc-700">
      {openFiles.map((file) => (
        <div
          key={file.name}
          onClick={() => onSwitch(file)}
          onContextMenu={(e) => handleContextMenu(e, file)}
          className={`flex items-center px-3 py-1 cursor-pointer border-r border-zinc-700 ${
            file.name === activeFile?.name ? "bg-zinc-700" : "bg-zinc-800"
          }`}
        >
          {file.name}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(file);
            }}
            className="ml-2 text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
      ))}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          options={menu.options}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
