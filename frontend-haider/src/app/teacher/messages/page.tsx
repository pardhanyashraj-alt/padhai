"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";

const students = [
  { id: 1, name: "Anjali Kapoor", initials: "AK", color: "var(--blue)", lastMsg: "Ma'am, I have a doubt in Algebra.", time: "10:30 AM", status: "online" },
  { id: 2, name: "Rohan Mehta", initials: "RM", color: "var(--orange)", lastMsg: "Thank you for the notes!", time: "9:45 AM", status: "offline" },
  { id: 3, name: "Shreya Mishra", initials: "SM", color: "var(--purple)", lastMsg: "When is the next test?", time: "Yesterday", status: "online" },
  { id: 4, name: "Priya Patel", initials: "PP", color: "var(--green)", lastMsg: "I've submitted my assignment.", time: "2 days ago", status: "offline" },
  { id: 5, name: "Vikram Singh", initials: "VS", color: "var(--blue-mid)", lastMsg: "Can we reschedule the extra class?", time: "Monday", status: "offline" },
];

const initialMessages = [
  { id: 1, senderId: 1, text: "Ma'am, I have a doubt in Algebra.", time: "10:30 AM", isMe: false },
  { id: 2, senderId: 1, text: "In Chapter 5, exercise 5.2, question 4.", time: "10:31 AM", isMe: false },
  { id: 3, senderId: 1, text: "I'm not able to get the right answer for the quadratic equation.", time: "10:32 AM", isMe: false },
  { id: 4, senderId: 0, text: "Hello Anjali! Don't worry, let me look at it.", time: "10:35 AM", isMe: true },
  { id: 5, senderId: 0, text: "Are you using the discriminant method or factoring?", time: "10:35 AM", isMe: true },
];

export default function TeacherMessages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChat, setActiveChat] = useState(students[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Responsive logic
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastMsg.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      senderId: 0,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");

    // Simulate Receiving Message
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg = {
        id: Date.now() + 1,
        senderId: activeChat.id,
        text: "Okay Ma'am, I will check that. Thank you!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 2000);
  };

  const handleSelectStudent = (student: typeof students[0]) => {
    setActiveChat(student);
    if (isMobile) {
      setShowChatMobile(true);
    }
  };

  return (
    <>
      <Sidebar activePage="messages" />
      <main className="main" style={{ 
        padding: '0', 
        display: 'flex', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Contacts Sidebar Pane */}
        <div style={{ 
          width: isMobile ? '100%' : '350px', 
          background: 'white', 
          borderRight: '1px solid #E2E8F0', 
          display: isMobile && showChatMobile ? 'none' : 'flex', 
          flexDirection: 'column',
          zIndex: 10
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Messages</h1>
            <div className="search-box" style={{ width: '100%' }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--text-meta)" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <div 
                  key={student.id} 
                  onClick={() => handleSelectStudent(student)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px 24px', 
                    cursor: 'pointer',
                    background: activeChat.id === student.id ? 'var(--blue-light)' : 'transparent',
                    borderLeft: activeChat.id === student.id ? '4px solid var(--blue)' : '4px solid transparent',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div className="avatar" style={{ background: student.color }}>{student.initials}</div>
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '0', 
                      right: '0', 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: student.status === 'online' ? 'var(--green)' : '#CBD5E1', 
                      border: '2px solid white' 
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{student.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-meta)' }}>{student.time}</div>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {student.lastMsg}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-meta)', fontSize: '14px' }}>
                No students found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        {/* Chat Window Pane */}
        <div style={{ 
          flex: 1, 
          display: isMobile && !showChatMobile ? 'none' : 'flex', 
          flexDirection: 'column', 
          background: '#E5DDD5', // WhatsApp-style background color
          position: isMobile ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20
        }}>
          {/* Top Header */}
          <div style={{ 
            padding: isMobile ? '10px 16px' : '16px 32px', 
            background: '#F0F2F5', // WhatsApp-style header color
            borderBottom: '1px solid #D1D7DB', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isMobile && (
                <button 
                  className="icon-btn" 
                  onClick={() => setShowChatMobile(false)}
                  style={{ border: 'none', background: 'transparent', padding: '4px' }}
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--blue)" strokeWidth="2.5">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="avatar" style={{ background: activeChat.color, width: isMobile ? '36px' : '40px', height: isMobile ? '36px' : '40px', fontSize: isMobile ? '12px' : '14px' }}>{activeChat.initials}</div>
              <div style={{ cursor: 'pointer' }}>
                <div style={{ fontWeight: 700, fontSize: isMobile ? '14px' : '16px' }}>{activeChat.name}</div>
                <div style={{ fontSize: '11px', color: activeChat.status === 'online' ? 'var(--green)' : 'var(--text-meta)' }}>
                  {isTyping ? "Typing..." : activeChat.status === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="icon-btn" style={{ width: isMobile ? '32px' : '38px', height: isMobile ? '32px' : '38px', background: 'transparent', border: 'none' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#54656F" strokeWidth="2">
                  <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </button>
              <button className="icon-btn" style={{ width: isMobile ? '32px' : '38px', height: isMobile ? '32px' : '38px', background: 'transparent', border: 'none' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#54656F" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div 
            className="whatsapp-bg"
            style={{ 
              flex: 1, 
              padding: isMobile ? '16px' : '24px 7%', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px'
            }}
          >
            <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.map((msg, index) => (
                <div key={msg.id} style={{ 
                  alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                  maxWidth: isMobile ? '90%' : '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.isMe ? 'flex-end' : 'flex-start',
                  marginBottom: '4px'
                }}>
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: msg.isMe ? '8px 0 8px 8px' : '0 8px 8px 8px', // WhatsApp-style bubble shape
                    background: msg.isMe ? '#dcf8c6' : 'white',
                    color: '#111b21',
                    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                    fontSize: '14.2px',
                    lineHeight: '1.4',
                    position: 'relative'
                  }}>
                    {msg.text}
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#667781', 
                      marginTop: '2px', 
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '3px'
                    }}>
                      {msg.time}
                      {msg.isMe && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.5">
                          <path d="M2.5 12.5l5 5 11-11M16 8l-8.5 8.5-3.5-3.5" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Typing Area */}
          <div style={{ padding: isMobile ? '8px 12px' : '10px 16px', background: '#F0F2F5', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button type="button" className="icon-btn" style={{ background: 'transparent', border: 'none', padding: '8px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#54656F" strokeWidth="2">
                <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button type="button" className="icon-btn" style={{ background: 'transparent', border: 'none', padding: '8px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#54656F" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <form onSubmit={handleSendMessage} style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Type a message" 
                className="form-input" 
                style={{ 
                  flex: 1, 
                  borderRadius: '24px', 
                  paddingLeft: '16px', 
                  height: '42px', 
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px' 
                }}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              {newMessage.trim() ? (
                <button 
                  type="submit" 
                  style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#54656F">
                    <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
                  </svg>
                </button>
              ) : (
                <button type="button" style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#54656F" strokeWidth="2">
                    <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
