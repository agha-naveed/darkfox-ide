// components/StatusBar.jsx
import { useState, useEffect } from "react";

export default function StatusBar({ fileName, language, editor }) {
  const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });

  // Update cursor position when the selection changes
  useEffect(() => {
    if (!editor) return;
    const disposable = editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
    return () => disposable.dispose();
  }, [editor]);

  return (
    <div className="h-8 fixed w-full z-[99999] bottom-0 left-0 bg-zinc-900 text-gray-300 flex justify-between items-center px-3 text-sm border-t border-gray-700">
      <div>
        {fileName || "No file"} &nbsp;|&nbsp; {language || "Plaintext"}
      </div>
      <div>
        Ln {cursorPos.line}, Col {cursorPos.column}
      </div>
    </div>
  );
}
