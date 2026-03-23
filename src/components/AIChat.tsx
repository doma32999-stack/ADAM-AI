import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, X, Key, Sparkles, ChevronDown, Plus, Copy, Check } from 'lucide-react';
import { askAIStream, AIModel } from '../services/aiService';
import { InfoCard } from '../constants';
import { Language, translations } from '../i18n';

interface Message {
  role: 'user' | 'ai';
  text: string;
  isError?: boolean;
  image?: string;
  modelType?: AIModel;
}

interface AIChatProps {
  selectedCard: InfoCard | null;
  onClose: () => void;
  language: Language;
}

export const AIChat: React.FC<AIChatProps> = ({ selectedCard, onClose, language }) => {
  const t = translations[language];
  const isRtl = language === 'ar';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedCard) {
      const initialPrompt = language === 'ar' 
        ? `أخبرني المزيد عن ${selectedCard.title.ar}.`
        : `Tell me more about ${selectedCard.title.en}.`;
      
      // Only send if it's the first message or if the card is different from the last one talked about
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || (lastMessage.role === 'ai' && messages.length === 1)) {
        handleSend(initialPrompt, selectedCard.content[language]);
      }
    }
  }, [selectedCard, language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input, context?: string) => {
    const messageText = text.trim();
    if (!messageText && !selectedImage) return;

    if (!context) setInput('');
    
    const currentImage = selectedImage;
    setSelectedImage(null);

    setMessages(prev => [...prev, { 
      role: 'user', 
      text: messageText, 
      image: currentImage?.preview 
    }]);
    setIsLoading(true);

    let aiResponse = "";
    const messageIndex = messages.length + 1;

    // Add placeholder for AI response
    setMessages(prev => [...prev, { role: 'ai', text: "", modelType: selectedModel }]);

    await askAIStream(
      messageText, 
      (chunk) => {
        aiResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[messageIndex] = { 
            ...newMessages[messageIndex], 
            text: aiResponse 
          };
          return newMessages;
        });
        setIsLoading(false); // Stop showing thinking as soon as we get first chunk
      },
      context, 
      language,
      currentImage ? { data: currentImage.data, mimeType: currentImage.mimeType } : undefined,
      selectedModel
    );
    
    // Final check for errors
    const isInvalidKey = aiResponse.includes("API key not valid") || 
                        aiResponse.includes("INVALID_ARGUMENT") ||
                        aiResponse.includes("API_KEY_INVALID") ||
                        aiResponse.includes("400") ||
                        aiResponse.includes("Incorrect API key") ||
                        aiResponse.includes("quota");
    
    if (isInvalidKey) {
      setMessages(prev => {
        const newMessages = [...prev];
        let errorText = "";
        
        if (selectedModel === 'gemini') {
          errorText = language === 'en' 
            ? "The Gemini API key provided is invalid or has expired. Please select a valid key to continue."
            : "مفتاح Gemini API المقدم غير صالح أو انتهت صلاحيته. يرجى تحديد مفتاح صالح للمتابعة.";
        } else {
          errorText = language === 'en'
            ? `The API key for ${selectedModel === 'copilot' ? 'Copilot' : 'OpenAI'} is missing or invalid. Please check your environment variables.`
            : `مفتاح API لـ ${selectedModel === 'copilot' ? 'Copilot' : 'OpenAI'} مفقود أو غير صالح. يرجى التحقق من متغيرات البيئة الخاصة بك.`;
        }
        
        newMessages[messageIndex] = { 
          ...newMessages[messageIndex], 
          text: errorText,
          isError: true,
          modelType: selectedModel
        };
        return newMessages;
      });
    }
    
    setIsLoading(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setSelectedImage(null);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setSelectedImage({
        data: base64String,
        mimeType: file.type,
        preview: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full glass rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      dir={isRtl ? 'rtl' : 'ltr'}
      id="ai-chat-container"
    >
      <div className={`p-4 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-md ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h4 className="font-bold text-sm text-white">{t.geminiAssistant}</h4>
            <p className="text-[10px] text-green-400 font-medium uppercase tracking-tighter">{t.onlineReady}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:bg-indigo-600/30 transition-all flex items-center gap-2 group"
          >
            <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span>{t.newChat}</span>
          </button>

          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              {selectedModel === 'gemini' || selectedModel === 'gemini-3-flash' ? 'Gemini 3' : 
               selectedModel === 'gemini-3.1-pro' ? 'Gemini 3.1 Pro' :
               selectedModel === 'gemini-3.1-flash-lite' ? 'Gemini 3.1 Lite' :
               selectedModel === 'gemini-1.5-flash' ? 'Gemini 1.5 (Free)' :
               selectedModel === 'gpt-4o' ? 'GPT-4o' : 
               selectedModel === 'gpt-3.5-turbo' ? 'GPT-3.5' : 'Copilot'}
              <ChevronDown className={`w-3 h-3 transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isModelMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-40 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  {(['gemini', 'gemini-3-flash', 'gemini-3.1-pro', 'gemini-3.1-flash-lite', 'gemini-1.5-flash', 'gpt-4o', 'gpt-3.5-turbo', 'copilot'] as AIModel[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedModel(m);
                        setIsModelMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/5 ${selectedModel === m ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400'}`}
                    >
                      {m === 'gemini' ? 'Gemini 3 (Default)' : 
                       m === 'gemini-3-flash' ? 'Gemini 3 Flash' :
                       m === 'gemini-3.1-pro' ? 'Gemini 3.1 Pro' :
                       m === 'gemini-3.1-flash-lite' ? 'Gemini 3.1 Lite' :
                       m === 'gemini-1.5-flash' ? 'Gemini 1.5 Flash (Truly Free)' :
                       m === 'gpt-4o' ? 'ChatGPT-4o' : 
                       m === 'gpt-3.5-turbo' ? 'ChatGPT-3.5' : 'MS Copilot'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            id="close-chat-btn"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/10"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-12 h-12 text-indigo-400" />
            <p className="text-sm font-medium text-white">{t.chatWelcome}</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? (isRtl ? 'justify-start' : 'justify-end') : (isRtl ? 'justify-end' : 'justify-start')}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed relative group/msg ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/10 backdrop-blur-md text-white shadow-sm border border-white/10 rounded-tl-none'
              } ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-center justify-between mb-1 opacity-60 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {msg.role === 'user' ? t.you : t.ai}
                    </span>
                  </div>
                  
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(msg.text, i)}
                    className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover/msg:opacity-100"
                    title={t.copy}
                  >
                    {copiedId === i ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-white/50" />
                    )}
                  </button>
                </div>
                {msg.image && (
                  <img src={msg.image} alt="User uploaded" className="max-w-full rounded-lg mb-3 border border-white/10" referrerPolicy="no-referrer" />
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
                {msg.isError && (
                  <div className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex flex-col items-center gap-3">
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-center">
                      {language === 'en' ? "Action Required" : "إجراء مطلوب"}
                    </p>
                    
                    {(!msg.modelType || msg.modelType === 'gemini') ? (
                      <button
                        // @ts-ignore
                        onClick={() => window.aistudio?.openSelectKey().then(() => window.location.reload())}
                        className="w-full px-4 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
                      >
                        <Key className="w-3 h-3" />
                        {language === 'en' ? "Select Valid API Key" : "تحديد مفتاح API صالح"}
                      </button>
                    ) : (
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
                      >
                        <Key className="w-3 h-3" />
                        {language === 'en' ? "Get OpenAI API Key" : "الحصول على مفتاح OpenAI"}
                      </a>
                    )}

                    <p className="text-[9px] text-gray-500 text-center leading-relaxed">
                      {(!msg.modelType || msg.modelType === 'gemini') ? (
                        language === 'en' 
                          ? "You need a valid Gemini API key from a paid Google Cloud project to use this model." 
                          : "تحتاج إلى مفتاح Gemini API صالح من مشروع Google Cloud مدفوع لاستخدام هذا النموذج."
                      ) : (
                        language === 'en'
                          ? "Add 'OPENAI_API_KEY' to your environment variables in the Settings menu (gear icon) to use this model."
                          : "أضف 'OPENAI_API_KEY' إلى متغيرات البيئة في قائمة الإعدادات (أيقونة الترس) لاستخدام هذا النموذج."
                      )}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex ${isRtl ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`bg-white/10 backdrop-blur-md p-4 rounded-2xl rounded-tl-none shadow-sm border border-white/10 flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs text-gray-400 font-medium">{t.aiThinking}</span>
            </div>
          </motion.div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="mt-8 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl"
        >
          {selectedImage && (
            <div className={`mb-3 relative inline-block ${isRtl ? 'float-right' : 'float-left'}`}>
              <img src={selectedImage.preview} alt="Selected" className="w-20 h-20 object-cover rounded-xl border border-white/20" referrerPolicy="no-referrer" />
              <button 
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="clear-both"></div>
          <div className="relative flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title={t.uploadImage}
            >
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </button>
            <div className="relative flex-grow">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chatPlaceholder}
                className={`w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${isRtl ? 'pr-4 pl-14 text-right' : 'pl-4 pr-14 text-left'}`}
                id="chat-input"
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className={`absolute top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors ${isRtl ? 'left-2' : 'right-2'}`}
                id="send-btn"
              >
                <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
