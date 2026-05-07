import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'markdown-to-jsx';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi there! I can help you find the perfect coaching institute or batch. What subject or location are you looking for?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [institutes, setInstitutes] = useState<any[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (!institutes) {
        fetch('/api/public/institutes')
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setInstitutes(data))
          .catch(console.error);
      }
    }
  }, [messages, isOpen, institutes]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { GoogleGenAI } = await import('@google/genai');
      // In AI Studio, process.env.GEMINI_API_KEY is typically available at runtime in the preview
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let currentInstitutes = institutes;
      if (!currentInstitutes) {
        const res = await fetch('/api/public/institutes');
        if (res.ok) {
          currentInstitutes = await res.json();
          setInstitutes(currentInstitutes);
        }
      }

      const systemInstruction = `You are a helpful AI assistant for the Coaching Direct platform. Your job is to help students find coaching institutes based on their requirements.
Here is the real-time JSON data of all available institutes and their batches on the platform:
${JSON.stringify(currentInstitutes || [], null, 2)}

Be friendly, concise, and professional. Recommend specific institutes and batches if they match the user's request. Format your response cleanly using Markdown.`;

      const formattedHistory = messages.slice(1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: systemInstruction,
        }
      });

      if (response && response.text) {
        setMessages([...newMessages, { role: 'model', text: response.text }]);
      } else {
        setMessages([...newMessages, { role: 'model', text: 'Sorry, I returned an empty response.' }]);
      }
    } catch (err: any) {
      console.error('Gemini Error:', err);
      let errorMsg = err.message || 'Unknown error occurred';
      if (errorMsg.includes('API key not valid')) {
        errorMsg = 'The AI model requires a valid API key. Please check your environment settings.';
      }
      setMessages([...newMessages, { role: 'model', text: `Sorry, I encountered an error: ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-apple-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-apple-blue-hover transition-colors z-50 focus:outline-none focus:ring-4 focus:ring-apple-blue/20"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-apple-border/40 dark:border-slate-800 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-apple-blue dark:bg-slate-800 p-4 flex items-center justify-between text-white shrink-0 border-b border-transparent dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px]">Coaching Direct AI</h3>
                  <p className="text-white/80 text-[11px] leading-tight">Your personal institute guide</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-apple-gray/50 dark:bg-slate-950">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-apple-text dark:bg-blue-600 text-white' : 'bg-apple-blue/10 dark:bg-blue-500/20 text-apple-blue dark:text-blue-400'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-apple-text dark:bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-900 border border-apple-border/50 dark:border-slate-800 text-apple-text dark:text-slate-200 rounded-tl-sm shadow-sm'
                    }`}>
                      <div className="markdown-body prose prose-sm prose-p:my-1 prose-a:text-apple-blue dark:prose-a:text-blue-400 prose-strong:text-inherit dark:prose-headings:text-white dark:text-slate-300">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%] flex-row">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-apple-blue/10 dark:bg-blue-500/20 text-apple-blue dark:text-blue-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl text-[14px] bg-white dark:bg-slate-900 border border-apple-border/50 dark:border-slate-800 text-apple-text rounded-tl-sm shadow-sm flex flex-col gap-1.5 min-w-[60px] justify-center items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-apple-blue dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-apple-border/30 dark:border-slate-800 shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-2.5 bg-apple-gray dark:bg-slate-800 border border-apple-border/50 dark:border-slate-700 dark:text-white rounded-full focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-[14px]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-apple-blue dark:bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-apple-blue-hover dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
