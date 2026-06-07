import React, { useState, useRef, useEffect } from 'react';

const AIChat = ({ userRole = 'student', userName = 'User', userStats = null, userMarks = null, userAttendance = null, userFees = null }) => {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi ${userName}! 👋 I'm your AI Campus Assistant. I can help you with academic questions, syllabus info, campus queries, and more. What would you like to know?`,
    }
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const messagesEndRef           = useRef(null);
  const inputRef                 = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const systemPrompt = `You are an AI Campus Assistant for EduAI Campus Management System.
The user's role is: ${userRole}
The user's name is: ${userName}

${userStats ? `STUDENT STATS:
- Attendance: ${userStats.attendancePct}%
- Average Marks: ${userStats.avgMarks}%
- Grade: ${userStats.grade}
- Fees Paid: ₹${userStats.paidFees}
- Pending Fees: ₹${userStats.pendingFees}` : ''}

${userMarks ? `MARKS DATA:
${userMarks.records?.map(r => `- ${r.subject} (${r.examType}): ${r.marks}/${r.maxMarks} - Grade: ${r.grade}`).join('\n')}
Overall Average: ${userMarks.average}%` : ''}

${userAttendance ? `ATTENDANCE DATA:
- Total Classes: ${userAttendance.summary?.total}
- Present: ${userAttendance.summary?.present}
- Absent: ${userAttendance.summary?.absent}
- Percentage: ${userAttendance.summary?.percentage}%` : ''}

${userFees ? `FEES DATA:
${userFees.fees?.map(f => `- ${f.feeType}: ₹${f.amount} (Status: ${f.status})`).join('\n')}` : ''}

Use this data to answer personal questions about the student's marks, attendance, fees, etc.
Be friendly, concise, and helpful.`;
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      }));

     const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    systemPrompt,
    messages: [...history, { role: 'user', content: userMsg }],
  }),
});
const data = await response.json();
const reply = data.reply || 'Sorry, I could not process that.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = {
    student: ['What is the attendance rule?', 'How to improve my grades?', 'When is the next exam?'],
    faculty: ['How to mark attendance?', 'How to upload marks?', 'What are my assigned subjects?'],
    parent:  ['How to check my child\'s attendance?', 'When are fees due?', 'How to contact faculty?'],
    admin:   ['How to add a new student?', 'How to generate reports?', 'How to manage users?'],
  };

  const suggestions = quickQuestions[userRole] || quickQuestions.student;

  return (
    <>
      <style>{`
        .ai-chat-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
        }

        .ai-chat-btn {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e6b45, #c9a227);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .ai-chat-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(0,0,0,0.3);
        }
        .ai-chat-btn.open { background: linear-gradient(135deg, #b83232, #8b1a1a); }

        .ai-chat-pulse {
          position: absolute;
          top: 0; right: 0;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #f0cd6a;
          border: 2px solid #fff;
          animation: ai-pulse 2s infinite;
        }
        @keyframes ai-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        .ai-chat-window {
          position: fixed;
          bottom: 96px;
          right: 28px;
          width: 370px;
          height: 520px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
          border: 1px solid rgba(201,162,39,0.2);
          animation: ai-slide-up 0.3s cubic-bezier(.22,1,.36,1);
        }
        @keyframes ai-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: none; }
        }

        .ai-chat-header {
          background: linear-gradient(135deg, #0d1b3e, #1e3060);
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid rgba(201,162,39,0.3);
        }
        .ai-chat-header-left { display: flex; align-items: center; gap: 10px; }
        .ai-chat-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #c9a227, #1e6b45);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          border: 2px solid rgba(201,162,39,0.4);
        }
        .ai-chat-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem; font-weight: 700; color: #f0e8d0;
        }
        .ai-chat-header-sub {
          font-size: 0.68rem; color: rgba(240,232,208,0.5);
          display: flex; align-items: center; gap: 4px;
        }
        .ai-online-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4db87a; display: inline-block;
        }
        .ai-chat-close {
          background: rgba(255,255,255,0.08); border: none;
          color: rgba(240,232,208,0.6); border-radius: 6px;
          width: 28px; height: 28px; cursor: pointer;
          font-size: 1rem; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .ai-chat-close:hover { background: rgba(255,255,255,0.15); color: #f0e8d0; }

        .ai-chat-messages {
          flex: 1; overflow-y: auto; padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
          background: #faf8f2;
        }
        .ai-chat-messages::-webkit-scrollbar { width: 4px; }
        .ai-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .ai-chat-messages::-webkit-scrollbar-thumb { background: #e5dfc8; border-radius: 4px; }

        .ai-msg {
          display: flex; gap: 8px; align-items: flex-start;
          animation: ai-msg-in 0.25s ease;
        }
        @keyframes ai-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        .ai-msg.user { flex-direction: row-reverse; }

        .ai-msg-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; flex-shrink: 0;
        }
        .ai-msg-avatar.bot {
          background: linear-gradient(135deg, #0d1b3e, #1e3060);
          border: 1.5px solid rgba(201,162,39,0.3);
        }
        .ai-msg-avatar.user-av {
          background: linear-gradient(135deg, #1e6b45, #2c8a5a);
        }

        .ai-msg-bubble {
          max-width: 80%; padding: 10px 13px;
          border-radius: 14px; font-size: 0.83rem;
          line-height: 1.6; font-family: 'DM Sans', sans-serif;
        }
        .ai-msg.bot .ai-msg-bubble {
          background: #fff;
          border: 1px solid rgba(201,162,39,0.15);
          color: #1a1208;
          border-radius: 4px 14px 14px 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .ai-msg.user .ai-msg-bubble {
          background: linear-gradient(135deg, #0d1b3e, #1e3060);
          color: #f0e8d0;
          border-radius: 14px 4px 14px 14px;
        }

        .ai-typing {
          display: flex; gap: 4px; align-items: center;
          padding: 10px 13px;
          background: #fff;
          border: 1px solid rgba(201,162,39,0.15);
          border-radius: 4px 14px 14px 14px;
          width: fit-content;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .ai-typing span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #c9a227; animation: ai-bounce 1.2s infinite;
        }
        .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ai-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        .ai-suggestions {
          padding: 8px 14px;
          display: flex; gap: 6px; flex-wrap: wrap;
          background: #faf8f2;
          border-top: 1px solid rgba(201,162,39,0.1);
        }
        .ai-suggestion-btn {
          font-size: 0.72rem; padding: 5px 10px;
          background: #fff; border: 1px solid rgba(201,162,39,0.25);
          border-radius: 100px; color: #7a6a40; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; white-space: nowrap;
        }
        .ai-suggestion-btn:hover {
          background: rgba(201,162,39,0.08);
          border-color: #c9a227; color: #8a6020;
        }

        .ai-chat-input-area {
          padding: 12px 14px;
          background: #fff;
          border-top: 1px solid rgba(201,162,39,0.15);
          display: flex; gap: 8px; align-items: flex-end;
        }
        .ai-chat-textarea {
          flex: 1; padding: 9px 12px;
          border: 1.5px solid rgba(201,162,39,0.2);
          border-radius: 10px; font-size: 0.85rem;
          font-family: 'DM Sans', sans-serif;
          color: #1a1208; background: #faf8f2;
          outline: none; resize: none;
          max-height: 80px; min-height: 38px;
          transition: border-color 0.2s;
          line-height: 1.5;
        }
        .ai-chat-textarea:focus { border-color: #c9a227; }
        .ai-chat-textarea::placeholder { color: #b0a080; }

        .ai-send-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #0d1b3e, #1e3060);
          border: none; cursor: pointer; color: #f0cd6a;
          font-size: 1rem; display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s, opacity 0.15s; flex-shrink: 0;
        }
        .ai-send-btn:hover { transform: scale(1.05); }
        .ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        @media (max-width: 480px) {
          .ai-chat-window { width: calc(100vw - 20px); right: 10px; bottom: 80px; }
        }
      `}</style>

      <div className="ai-chat-fab">
        {/* Chat Window */}
        {isOpen && (
          <div className="ai-chat-window">
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-left">
                <div className="ai-chat-avatar">🤖</div>
                <div>
                  <div className="ai-chat-header-title">AI Campus Assistant</div>
                  <div className="ai-chat-header-sub">
                    <span className="ai-online-dot"></span> Online · Powered by Claude
                  </div>
                </div>
              </div>
              <button className="ai-chat-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            {/* Messages */}
            <div className="ai-chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`ai-msg ${msg.role === 'assistant' ? 'bot' : 'user'}`}>
                  <div className={`ai-msg-avatar ${msg.role === 'assistant' ? 'bot' : 'user-av'}`}>
                    {msg.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  <div className="ai-msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="ai-msg bot">
                  <div className="ai-msg-avatar bot">🤖</div>
                  <div className="ai-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="ai-suggestions">
                {suggestions.map((q, i) => (
                  <button key={i} className="ai-suggestion-btn"
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="ai-chat-input-area">
              <textarea
                ref={inputRef}
                className="ai-chat-textarea"
                placeholder="Ask me anything…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <button className="ai-send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                ➤
              </button>
            </div>
          </div>
        )}

        {/* FAB Button */}
        <button
          className={`ai-chat-btn ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title="AI Campus Assistant"
        >
          {isOpen ? '✕' : '🤖'}
          {!isOpen && <span className="ai-chat-pulse" />}
        </button>
      </div>
    </>
  );
};

export default AIChat;