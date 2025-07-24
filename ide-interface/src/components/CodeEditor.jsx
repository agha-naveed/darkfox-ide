import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

// Force Monaco to use local module
loader.config({ monaco });

// Configure worker paths
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === "json") return "./json.worker.bundle.js";
    if (label === "css" || label === "scss" || label === "less") return "./css.worker.bundle.js";
    if (label === "html" || label === "handlebars" || label === "razor") return "./html.worker.bundle.js";
    if (label === "typescript" || label === "javascript") return "./ts.worker.bundle.js";
    return "./editor.worker.bundle.js";
  },
};

export default function CodeEditor({ content, setContent, language }) {
  return (
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
        minimap: { enabled: false },
      }}
    />
  );
}
