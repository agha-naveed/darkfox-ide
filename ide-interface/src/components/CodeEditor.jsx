import Editor, { loader } from "@monaco-editor/react";
import { useEffect } from "react";

// loader.config({ paths: { vs: '/vs' } });
const baseURL = import.meta.env.DEV
  ? "http://localhost:5173/vs"
  : `${window.location.origin}/vs`;

loader.config({ paths: { vs: baseURL } });

export default function CodeEditor({ content, setContent, language, onSave, setEditorInstance }) {
  useEffect(() => {
    console.log("Monaco loading from:", window.location.origin + '/vs');
  }, []);

  return (
    <div className="flex-1 relative">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={content}
        onChange={(val) => setContent(val)}
        options={{
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
          automaticLayout: true,
          minimap: { enabled: true },
        }}
        onMount={(editor, monaco) => {
          editor.addCommand(monaco.KeyMod.CtrlCmd & monaco.KeyCode.KeyS, () => {
            if (onSave) onSave();
          });
        }}
      />

    </div>
  );
}
