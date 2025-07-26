import Editor, { loader } from "@monaco-editor/react";
import { useEffect } from "react";
import * as monaco from "monaco-editor";

// loader.config({ paths: { vs: '/vs' } });
const API_URL = import.meta.env.VITE_API_KEY;

const baseURL = import.meta.env.DEV
  ? "http://localhost:5173/vs"
  : `${window.location.origin}/vs`;

loader.config({ paths: { vs: baseURL } });

export default function CodeEditor({ content, setContent, language, onSave, setEditorInstance }) {
  useEffect(() => {
    console.log("Monaco loading from:", window.location.origin + '/vs');
  }, []);

  useEffect(() => {
    let provider = monaco.languages.registerInlineCompletionsProvider(language, {
      provideInlineCompletions: async (model, position) => {
        const codeSoFar = model.getValue();
        const suggestion = await fetchSuggestionFromAI(codeSoFar, position);

        if (!suggestion) return { items: [] };

        return {
          items: [
            {
              text: suggestion,
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
              command: {
                id: "acceptInlineSuggestion",
                title: "Accept Suggestion",
              },
            },
          ],
        };
      },
      freeInlineCompletions: () => {},
    });

    return () => provider.dispose();
  }, [language]);

  // Fetch AI suggestion
  async function fetchSuggestionFromAI(currentCode, position) {
    const cohere = new CohereClientV2({ token: API_URL });
    
    try {
      const response = await cohere.chat({
        model: 'command-a-03-2025',
        messages: [
            { role: "system", content: "You are a coding assistant. Respond ONLY with code continuation." },
            { role: "user", content: `Continue writing code:\n${currentCode}` },
          ],
      });

      // const data = await response.json();
      // const suggestion = data.choices[0].message.content.trim();
      const suggestion = extractCode(response?.message?.content?.[0]?.text);
      
      return suggestion;
    } catch (err) {
      console.error("AI autocomplete error:", err);
      return "";
    }
  }

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
          inlineSuggest: { enabled: true },
        }}
        onMount={(editor, monaco) => {
          setEditorInstance(editor);
          editor.addCommand(monaco.KeyMod.CtrlCmd & monaco.KeyCode.KeyS, () => {
            // if (onSave) onSave();
          });
          editor.addCommand(monaco.KeyMod.CtrlCmd & monaco.KeyMod.Shift & monaco.KeyCode.KeyS, () => {
            // if (onSave) onSave();
          });
        }}
      />

    </div>
  );
}
