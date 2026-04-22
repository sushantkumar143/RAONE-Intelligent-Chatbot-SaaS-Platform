import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, MessageSquare, Bot, User, Loader2 } from 'lucide-react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await chatAPI.getConversations();
      setConversations(res.data || []);
    } catch (err) {
      console.error('Failed to load conversations');
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const res = await chatAPI.getMessages(conversationId);
      setMessages(res.data.messages || res.data || []);
      setActiveConversation(conversationId);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMessage = { role: 'user', content: input, id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await chatAPI.send({
        message: input,
        conversation_id: activeConversation,
      });
      const { message: reply, conversation_id } = res.data;
      setMessages((prev) => [...prev, reply]);
      if (!activeConversation) {
        setActiveConversation(conversation_id);
        loadConversations();
      }
    } catch (err) {
      toast.error('Failed to send message');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const newConversation = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Conversations Sidebar */}
      <div className="w-72 flex-shrink-0 glass-card p-4 flex flex-col hidden lg:flex">
        <button onClick={newConversation} className="btn-primary w-full flex items-center gap-2 justify-center mb-4">
          <Plus className="w-4 h-4" /> New Chat
        </button>
        <div className="flex-1 overflow-auto space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadMessages(conv.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                activeConversation === conv.id
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{conv.title || 'New Conversation'}</span>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Start a Conversation</h3>
              <p className="text-gray-400 max-w-md">
                Ask anything about your uploaded knowledge base. Your AI chatbot is ready to help.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-500/20 text-white border border-primary-500/20'
                    : 'bg-white/5 text-gray-200 border border-white/5'
                }`}
              >
                <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Sources:</p>
                    {msg.sources.map((src, j) => (
                      <span key={j} className="text-xs text-primary-400 mr-2">
                        📄 {src.source_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
                <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3">
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask anything..."
              className="input-field flex-1"
              disabled={sending}
            />
            <button
              id="chat-send"
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="btn-primary px-4 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
