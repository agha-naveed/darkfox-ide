import { CohereClientV2 } from 'cohere-ai';

const API_URL = import.meta.env.API_KEY;

const AIData = async (prompt) => {
  const cohere = new CohereClientV2({ token: API_URL });

  const result = await cohere.chat({
    model: 'command-a-03-2025',
    messages: [{ role: 'user', content: prompt }],
  });

  if (result?.message?.content?.[0]?.text) {
    const responseText = applyBranding(result.message.content[0].text);
    return { message: 'text', data: responseText };
  }

  return { message: 'error', data: 'No content generated.' };
};

function applyBranding(text) {
    return text
}

export default AIData;
