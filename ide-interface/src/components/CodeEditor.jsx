import Editor, { loader } from "@monaco-editor/react";
import { useEffect } from "react";

// loader.config({ paths: { vs: '/vs' } });
const monacoBaseUrl = `${window.location.origin}/vs`;
loader.config({ paths: { vs: monacoBaseUrl } });

export default function CodeEditor({ content, setContent, language, onSave, setEditorInstance }) {
  useEffect(() => {
    console.log("Monaco loading from:", window.location.origin + '/vs');
  }, []);
  return (
    <div className="flex-1 relative">
      <Editor
        height="100%"
        language={language || "plaintext"}
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
          // Save editor instance for StatusBar
          if (setEditorInstance) setEditorInstance(editor);

          // Bind Ctrl+S for save
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (onSave) onSave(content);
          });
        }}
      />
    </div>
  );
}
