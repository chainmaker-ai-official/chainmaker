// This file will contain the logic for connecting to the DeepSeek API.

// Function to send a message to the DeepSeek API
export async function sendMessageToDeepSeek(message) {
  try {
    // For Vite, we need to use import.meta.env instead of process.env
    const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'your-deepseek-api-key-here';
    
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your-deepseek-api-key-here') {
      throw new Error('DeepSeek API key not configured. Please set VITE_DEEPSEEK_API_KEY in your .env file');
    }

    const DEEPSEEK_MODEL = 'deepseek-chat';
    const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

    console.log('Sending request to DeepSeek API...');
    
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
      console.error('DeepSeek API error response:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response:', data);
    
    // Extract the text from the response
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

// You can add more functions here for different DeepSeek API interactions
