import Editor from "@monaco-editor/react";
// import * as monaco from "monaco-editor";
import jsonWorker from '../../public/workers/json.worker';
import cssWorker from '../../public/workers/css.worker';
import editorWorker from '../../public/workers/editor.worker';
import htmlWorker from '../../public/workers/html.worker';
import tsWorker from '../../public/workers/ts.worker';

// loader.config({ monaco });

// self.MonacoEnvironment = {
//   getWorker: function (_, label) {
//     if (label === "json") return new jsonWorker();
//     if (label === "css" || label === "scss" || label === "less") return new cssWorker();
//     if (label === "html" || label === "handlebars" || label === "razor") return new htmlWorker();
//     if (label === "typescript" || label === "javascript") return new tsWorker();
//     return new editorWorker();
//   },
// };

// self.MonacoEnvironment = {
//   getWorkerUrl: function (_, label) {
//     if (label === "json") return jsonWorker;
//     if (label === "css") return cssWorker;
//     if (label === "html") return htmlWorker;
//     if (label === "typescript" || label === "javascript") return tsWorker;
//     return editorWorker;
//   },
// };
self.MonacoEnvironment = {
  getWorkerUrl: function (_, label) {
    if (label === "json") return "/workers/json.worker.js";
    if (label === "css" || label === "scss" || label === "less") return "/workers/css.worker.js";
    if (label === "html" || label === "handlebars" || label === "razor") return "/workers/html.worker.js";
    if (label === "typescript" || label === "javascript") return "/workers/ts.worker.js";
    return "/workers/editor.worker.js";
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
      options={{ fontSize: 14, automaticLayout: true }}
    />
  );
}
