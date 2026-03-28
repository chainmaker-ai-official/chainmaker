export async function sendMessageToDeepSeek(message: string) {
  try {
    const DEEPSEEK_API_KEY = (import.meta as any).env.VITE_DEEPSEEK_API_KEY;
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured. Please set VITE_DEEPSEEK_API_KEY in your .env file');
    }

    const DEEPSEEK_MODEL = 'deepseek-chat';
    const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 8192,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No response text received from DeepSeek API');
    }
    
    return text;
  } catch (error) {
    console.error("Error communicating with DeepSeek API:", error);
    throw error;
  }
}
