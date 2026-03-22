// This file will contain the logic for connecting to the Gemini API.

// Function to send a message to the Gemini API
export async function sendMessageToGemini(message) {
  try {
    const GEMINI_API_KEY = 'AIzaSyADUVGay3300kiirTMZIf91lCWd5KQMiAs';
    const GEMINI_MODEL = 'gemini-2.5-flash';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract the text from the response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No response text received from Gemini API');
    }
    
    return text;
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    throw error;
  }
}

// You can add more functions here for different Gemini API interactions
