import React, { useState, useRef, useEffect } from 'react';
import './Chat.css'; // Import the new CSS
import { sendMessageToGemini } from '../../api/gemini.js';
import { sendMessageToDeepSeek } from '../../api/deepseek.jsx';
import { getPromptTemplate } from '../../prompts/prompt.js';

const Chat = ({ onDesignerDataUpdate }) => { // Removed isOpen and onToggle as state is now internal
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [apiStatus, setApiStatus] = useState('Ready');
  const [selectedService, setSelectedService] = useState('gemini'); // 'gemini' or 'deepseek'
  const messagesEndRef = useRef(null);

  // New state for chatbox
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFull, setChatFull] = useState(false);
  const chatboxRef = useRef(null);
  const chatToggleRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeChat();
  }, []);

  // New useEffect for handling click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatOpen &&
        chatboxRef.current &&
        !chatboxRef.current.contains(event.target) &&
        chatToggleRef.current &&
        !chatToggleRef.current.contains(event.target)
      ) {
        closeChat();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [chatOpen]); // Depend on chatOpen state

  const addBubble = (text, type) => {
    const newMessage = { id: Date.now(), text, type };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateBubble = (id, newText) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id
          ? { ...msg, text: newText }
          : msg
      )
    );
  };

  const appendTypingIndicator = () => {
    const typingMessage = { id: 'typing', text: '<span class="dot"></span><span class="dot"></span><span class="dot"></span>', type: 'bot typing' };
    setMessages(prev => [...prev, typingMessage]);
  };

  const removeTypingIndicator = () => {
    setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
  };

  const updateApiStatus = (status) => {
    let statusText = '';
    switch (status) {
      case 'connected':
        statusText = 'Connected';
        break;
      case 'pending':
        statusText = 'Thinking...';
        break;
      case 'error':
        statusText = 'Error';
        break;
      case 'ready':
      default:
        statusText = 'Ready';
    }
    setApiStatus(statusText);
  };

  const initializeChat = () => {
    setMessages([]);
    addBubble('Hello! How can I help you today?', 'bot');
    updateApiStatus('ready');
  };

  const processMessage = async (msg) => {
    addBubble(msg, 'user');
    setIsThinking(true);
    appendTypingIndicator();
    const llmMessage = addBubble('', 'bot');
    
    updateApiStatus('pending');

    try {
      // Get the prompt template and inject the user message
      const promptTemplate = getPromptTemplate();
      const fullPrompt = promptTemplate.replace('The user wants content for the main topic of the lesson.', `The user wants content about: ${msg}`);
      
      // Send to selected API service
      let response;
      if (selectedService === 'deepseek') {
        response = await sendMessageToDeepSeek(fullPrompt);
      } else {
        response = await sendMessageToGemini(fullPrompt);
      }
      
      removeTypingIndicator();
      updateBubble(llmMessage.id, response);
      setIsThinking(false);
      updateApiStatus('connected');

      // Try to parse the JSON response and pass it to the designer
      try {
        // Multiple strategies to extract JSON
        let parsedData = null;
        
        // Strategy 1: Try to parse the entire response as JSON first
        try {
          parsedData = JSON.parse(response);
        } catch (e) {
          // Strategy 2: Extract JSON from markdown code blocks
          const jsonBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonBlockMatch) {
            parsedData = JSON.parse(jsonBlockMatch[1].trim());
          } else {
            // Strategy 3: Find the first { and last } and try to parse
            const jsonStartIndex = response.indexOf('{');
            const jsonEndIndex = response.lastIndexOf('}');
            
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
              const jsonString = response.substring(jsonStartIndex, jsonEndIndex + 1);
              parsedData = JSON.parse(jsonString);
            } else {
              // Strategy 4: Look for JSON-like structure with balanced braces
              const braceCount = (response.match(/{/g) || []).length;
              const closingBraceCount = (response.match(/}/g) || []).length;
              
              if (braceCount > 0 && braceCount === closingBraceCount) {
                // Try to find the main JSON object
                let depth = 0;
                let start = -1;
                let end = -1;
                
                for (let i = 0; i < response.length; i++) {
                  if (response[i] === '{') {
                    if (depth === 0) start = i;
                    depth++;
                  } else if (response[i] === '}') {
                    depth--;
                    if (depth === 0) {
                      end = i;
                      break;
                    }
                  }
                }
                
                if (start !== -1 && end !== -1) {
                  const jsonString = response.substring(start, end + 1);
                  parsedData = JSON.parse(jsonString);
                }
              }
            }
          }
        }
        
        // If we successfully parsed JSON, pass it to the designer
        if (parsedData && onDesignerDataUpdate) {
          console.log('Successfully parsed JSON data:', parsedData);
          onDesignerDataUpdate(parsedData);
        } else {
          console.warn('No valid JSON found in response');
          // Add a message to the chat about the parsing issue
          updateBubble(llmMessage.id, response + '\n\n⚠️ Note: Could not parse structured data from this response.');
        }
      } catch (parseError) {
        console.warn('Could not parse JSON from response:', parseError);
        // Still show the response but indicate parsing failed
        updateBubble(llmMessage.id, response + '\n\n⚠️ Note: Could not parse structured data from this response.');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      updateBubble(llmMessage.id, `Sorry, there was an error: ${error.message}`);
      updateApiStatus('error');
      removeTypingIndicator();
      setIsThinking(false);
    }
  };

  const handleSend = () => {
    const txt = userInput.trim();
    if (!txt) return;
    processMessage(txt);
    setUserInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  /* MINI OPEN (first stage) */
  const openMini = () => {
    setChatOpen(true);
    setChatFull(false);
  };

  /* EXPAND TO FULL HEIGHT / COLLAPSE TO MINI */
  const expandFull = () => {
    setChatFull(prevChatFull => !prevChatFull);
  };

  /* CLOSE ALL THE WAY */
  const closeChat = () => {
    setChatOpen(false);
    setChatFull(false);
  };

  /* MINIMIZE TO MINI STATE OR CLOSE */
  const minimizeChat = () => {
    if (chatFull) {
      // If in full state, minimize to mini
      setChatFull(false);
    } else {
      // If already in mini state, close completely
      setChatOpen(false);
      setChatFull(false);
    }
  };

  return (
    <>
      {/* CHATBOX */}
      <div
        id="chatbox"
        ref={chatboxRef}
        className={`chatbox ${chatOpen ? 'chat-open' : ''} ${chatFull ? 'chat-full' : ''}`}
      >
        <div className="chat-header"></div> {/* Empty header */}

        {/* Controls container for buttons and service selection */}
        <div className="chat-controls">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="chat-service-select"
            disabled={isThinking}
          >
            <option value="gemini">Gemini</option>
            <option value="deepseek">DeepSeek</option>
          </select>
          <button id="chatExpand" className={`chat-expand-btn ${!chatFull ? 'collapsed' : ''}`} onClick={expandFull}></button>
          <button id="chatClose" className="chat-close-btn" onClick={minimizeChat}></button>
        </div>

        <div className="chat-content">
          {/* Chat Area */}
          <div className="chat-area">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bubble ${message.type}`}
                dangerouslySetInnerHTML={{ __html: message.text }}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Moved out of chat-content to always be visible at the bottom */}
        <div className="input-area">
            <input
                id="user-input"
                className="chat-input"
                placeholder="Type your message…"
                autoComplete="off"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isThinking}
            />
            <button
                id="send-btn"
                className="chat-send-btn"
                onClick={handleSend}
                disabled={isThinking}
            >
                ➤
            </button>
        </div>
      </div>

      {/* CHAT TOGGLE BUTTON */}
      <button
        id="chatToggle"
        ref={chatToggleRef}
        className={`chat-toggle ${chatOpen ? 'chat-open' : ''}`}
        onClick={openMini}
      ></button>
    </>
  );
};

export default Chat;
