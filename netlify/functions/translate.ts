// netlify/functions/translate.ts
import axios from 'axios';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text, targetLang } = JSON.parse(event.body || '{}');

    if (!text || !targetLang) {
      return { statusCode: 400, body: 'Missing text or targetLang' };
    }

    const response = await axios.post("https://libretranslate.de/translate", {
      q: text,
      source: "auto",
      target: targetLang,
      format: "text",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ translatedText: response.data.translatedText || "" }),
    };
  } catch (error) {
    console.error("Translation error:", error);
    return { statusCode: 500, body: 'Failed to translate text.' };
  }
};