import { CohereClientV2 } from 'cohere-ai';

const API_URL = import.meta.env.VITE_API_KEY;

import { useState } from "react";

export default function AIPrompt({ isOpen, onClose, editorInstance }) {

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const extractCode = (text) => {
    const match = text.match(/```[a-z]*\n([\s\S]*?)```/);
    return match ? match[1].trim() : text.trim();
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const cohere = new CohereClientV2({ token: API_URL });

      const response = await cohere.chat({
        model: 'command-a-03-2025',
        messages: [
            { role: "system", content: "You are a coding assistant. Respond ONLY with code, no explanations." },
            { role: "user", content: prompt },
          ],
      });

      const code = extractCode(response?.message?.content?.[0]?.text);

      // Insert into Monaco
      if (editorInstance) {
        editorInstance.executeEdits("", [
          { range: editorInstance.getSelection(), text: code }
        ]);
      }

      onClose(); // close modal after insert
    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-4 rounded w-1/3">
        <h2 className="text-white mb-2">AI Code Generator</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the code you want..."
          className="w-full p-2 bg-gray-800 text-white rounded"
          rows={4}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="px-3 py-1 bg-gray-600 rounded text-white">Cancel</button>
          <button onClick={handleGenerate} disabled={loading} className="px-3 py-1 bg-blue-600 rounded text-white">
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
