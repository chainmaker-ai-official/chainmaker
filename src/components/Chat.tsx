import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, Minus, Send, MessageSquare } from 'lucide-react';
import { sendMessageToGemini } from '../api/gemini';
import { sendMessageToDeepSeek } from '../api/deepseek';
import { getPromptTemplate } from '../prompts/prompt';

interface Message {
  id: string | number;
  text: string;
  type: string;
}

interface ChatProps {
  onDesignerDataUpdate?: (data: any) => void;
}

const Chat: React.FC<ChatProps> = ({ onDesignerDataUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [apiStatus, setApiStatus] = useState('Ready');
  const [selectedService, setSelectedService] = useState<'gemini' | 'deepseek'>('gemini');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatFull, setChatFull] = useState(false);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const chatToggleRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatOpen &&
        chatboxRef.current &&
        !chatboxRef.current.contains(event.target as Node) &&
        chatToggleRef.current &&
        !chatToggleRef.current.contains(event.target as Node)
      ) {
        closeChat();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [chatOpen]);

  const addBubble = (text: string, type: string) => {
    const newMessage = { id: Date.now(), text, type };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateBubble = (id: string | number, newText: string) => {
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

  const updateApiStatus = (status: string) => {
    let statusText = '';
    switch (status) {
      case 'connected': statusText = 'Connected'; break;
      case 'pending': statusText = 'Thinking...'; break;
      case 'error': statusText = 'Error'; break;
      case 'ready':
      default: statusText = 'Ready';
    }
    setApiStatus(statusText);
  };

  const initializeChat = () => {
    setMessages([]);
    addBubble('Hello! How can I help you today?', 'bot');
    updateApiStatus('ready');
  };

  const processMessage = async (msg: string) => {
    addBubble(msg, 'user');
    setIsThinking(true);
    appendTypingIndicator();
    const llmMessage = addBubble('', 'bot');
    
    updateApiStatus('pending');

    try {
      const promptTemplate = getPromptTemplate();
      const fullPrompt = promptTemplate.replace('The user wants content for the main topic of the lesson.', `The user wants content about: ${msg}`);
      
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

      try {
        let parsedData = null;
        try {
          parsedData = JSON.parse(response);
        } catch (e) {
          const jsonBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonBlockMatch) {
            parsedData = JSON.parse(jsonBlockMatch[1].trim());
          } else {
            const jsonStartIndex = response.indexOf('{');
            const jsonEndIndex = response.lastIndexOf('}');
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
              const jsonString = response.substring(jsonStartIndex, jsonEndIndex + 1);
              parsedData = JSON.parse(jsonString);
            }
          }
        }
        
        if (parsedData && onDesignerDataUpdate) {
          onDesignerDataUpdate(parsedData);
        }
      } catch (parseError) {
        console.warn('Could not parse JSON from response:', parseError);
      }
    } catch (error: any) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const openMini = () => {
    setChatOpen(true);
    setChatFull(false);
  };

  const expandFull = () => {
    setChatFull(prev => !prev);
  };

  const closeChat = () => {
    setChatOpen(false);
    setChatFull(false);
  };

  const minimizeChat = () => {
    if (chatFull) {
      setChatFull(false);
    } else {
      setChatOpen(false);
      setChatFull(false);
    }
  };

  return (
    <>
      <div
        id="chatbox"
        ref={chatboxRef}
        className={`chatbox ${chatOpen ? 'chat-open' : ''} ${chatFull ? 'chat-full' : ''}`}
      >
        <div className="h-[10px]"></div>

        <div className="absolute top-[18px] right-[18px] flex items-center gap-2.5 z-[1002]">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value as 'gemini' | 'deepseek')}
            className="border border-[#56B6C266] rounded-xl bg-[#0a152599] px-3 py-2 text-[0.9em] text-[#ABB2BF] cursor-pointer outline-none transition-all hover:border-[#C678DD] hover:bg-[#0f1a2ab3]"
            disabled={isThinking}
          >
            <option value="gemini">Gemini</option>
            <option value="deepseek">DeepSeek</option>
          </select>
          <button 
            className={`w-10 h-10 border border-[#56B6C266] rounded-xl bg-[#0a152599] cursor-pointer text-xl text-[#ABB2BF] flex justify-center items-center transition-all hover:border-[#C678DD] ${!chatFull ? 'rotate-180' : ''}`} 
            onClick={expandFull}
          >
            {chatFull ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button 
            className="w-10 h-10 border border-[#56B6C266] rounded-xl bg-[#0a152599] cursor-pointer text-xl text-[#ABB2BF] flex justify-center items-center transition-all hover:border-[#D19A66]" 
            onClick={minimizeChat}
          >
            <Minus size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-10 pt-10 pb-5 text-[#ABB2BF]">
          <div className="flex flex-col gap-3">
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

        <div className="absolute bottom-0 left-0 right-0 p-5 bg-[#0a1525cc] border-t border-[#56B6C266] flex items-center gap-2.5 box-border">
            <input
                className="flex-grow border border-[#56B6C266] rounded-xl bg-[#000C1D99] px-4 py-2.5 text-base text-[#ABB2BF] outline-none transition-all focus:border-[#C678DD] focus:shadow-[0_0_0_2px_rgba(198,120,221,0.2)] placeholder:text-[#56B6C2]"
                placeholder="Type your message..."
                autoComplete="off"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isThinking}
            />
            <button
                className="w-10 h-10 border border-[#56B6C266] rounded-xl bg-[#0a152599] cursor-pointer text-xl text-[#ABB2BF] flex justify-center items-center transition-all hover:not-disabled:border-[#C678DD] hover:not-disabled:bg-[#c678dd26] hover:not-disabled:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={isThinking}
            >
                <Send size={20} />
            </button>
        </div>
      </div>

      <button
        id="chatToggle"
        ref={chatToggleRef}
        className={`fixed bottom-5 right-5 w-[60px] h-[60px] bg-gradient-to-br from-[#0a1525] via-[#0f1a2a] to-[#0a1525] border border-[#56B6C266] rounded-tr-[20px] rounded-bl-[20px] cursor-pointer z-[1001] flex justify-center items-center transition-all hover:scale-105 hover:border-[#D19A66] ${chatOpen ? 'opacity-0 invisible pointer-events-none' : ''}`}
        onClick={openMini}
      >
        <MessageSquare className="text-[#56B6C2] drop-shadow-[0_0_8px_rgba(86,182,194,0.5)]" size={30} />
      </button>
    </>
  );
};

export default Chat;
