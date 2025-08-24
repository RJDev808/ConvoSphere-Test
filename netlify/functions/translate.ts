// netlify/functions/translate.ts
import axios from 'axios';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text, targetLang } = JSON.parse(event.body || '{}');
    
    // --- NEW LOGGING ---
    console.log("Received for translation:", { text, targetLang });

    if (!text || !targetLang) {
      console.log("Validation failed: Missing text or targetLang.");
      return { statusCode: 400, body: 'Missing text or targetLang' };
    }

    const response = await axios.post("https://libretranslate.de/translate", {
      q: text,
      source: "auto",
      target: targetLang,
      format: "text",
    });

    // --- NEW LOGGING ---
    console.log("Data from LibreTranslate API:", response.data);

    const translatedText = response.data?.translatedText || "";

    return {
      statusCode: 200,
      body: JSON.stringify({ translatedText: translatedText }),
    };
  } catch (error) {
    console.error("Function crashed:", error);
    return { statusCode: 500, body: 'Function encountered an error.' };
  }
};