import { useEffect } from "react";

export default function ContextMenu({ position, onClose, onAction }) {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="absolute bg-zinc-800 text-white rounded shadow-lg py-1 z-50"
      style={{ top: position.y, left: position.x, minWidth: "150px" }}
    >
      <button
        className="block w-full text-left px-4 py-2 hover:bg-zinc-700"
        onClick={() => onAction("newFile")}
      >
        New File
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-zinc-700"
        onClick={() => onAction("newFolder")}
      >
        New Folder
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-zinc-700"
        onClick={() => onAction("rename")}
      >
        Rename
      </button>
      <button
        className="block w-full text-left px-4 py-2 hover:bg-red-600"
        onClick={() => onAction("delete")}
      >
        Delete
      </button>
    </div>
  );
}
