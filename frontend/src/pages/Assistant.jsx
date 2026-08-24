import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Send, Bot, User, Trash2 } from 'lucide-react';

const Assistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the RetailVision Business Assistant. Ask me about sales, top products, low stock, customer segments, or sales anomalies.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const exampleQuestions = [
    "What were total sales this month?",
    "Which products are low on stock?",
    "Which products have high stock-out risk?",
    "What are the recent sales anomalies?",
    "Which customer segment has the highest spending?",
    "How much was sold through POS vs ONLINE?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question) => {
    const q = typeof question === 'string' ? question : input;
    if (!q.trim()) return;

    const newMessages = [...messages, { role: 'user', content: q }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/query', { question: q });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the business database.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Conversation cleared. How can I help you today?' }]);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bot /> AI Business Assistant</h2>
        <button onClick={clearChat} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Trash2 className="icon-sm"/> Clear
        </button>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' 
            }}>
              <div style={{ 
                maxWidth: '75%', 
                padding: '0.85rem 1.15rem', 
                borderRadius: '12px',
                background: m.role === 'user' ? 'var(--primary)' : '#ffffff',
                color: m.role === 'user' ? '#fff' : 'var(--text-main)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                boxShadow: m.role === 'assistant' ? 'var(--shadow-sm)' : 'none',
                border: m.role === 'assistant' ? '1px solid var(--border)' : 'none'
              }}>
                {m.role === 'assistant' && <div style={{ background: '#eff6ff', padding: '0.4rem', borderRadius: '50%', color: 'var(--primary)' }}><Bot className="icon-sm" /></div>}
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', marginTop: '0.2rem' }}>{m.content}</div>
                {m.role === 'user' && <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '50%', color: '#fff' }}><User className="icon-sm" /></div>}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: '#f1f5f9', color: '#64748b' }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {exampleQuestions.map((q, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(q)}
                disabled={loading}
                style={{ 
                  whiteSpace: 'nowrap', 
                  padding: '0.4rem 0.75rem', 
                  fontSize: '0.75rem', 
                  borderRadius: '16px', 
                  border: '1px solid #cbd5e1', 
                  background: '#fff', 
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                {q}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a business question..."
              style={{ flex: 1, padding: '0.75rem', height: '48px' }}
              disabled={loading}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', padding: 0 }}
            >
              <Send className="icon-sm" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Assistant;
