import Editor from "@monaco-editor/react";

export default function CodeEditor({ content, setContent, language, onSave }) {
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
          // Bind Ctrl+S for save
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (onSave) onSave(content);
          });
        }}
      />
    </div>
  );
}
