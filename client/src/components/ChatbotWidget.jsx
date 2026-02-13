import React, { useState, useRef, useEffect } from "react";
import axios from "../api/axiosClient";

export default function ChatbotWidget({ startOpen = false }) {
  const [open, setOpen] = useState(!!startOpen);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const msgEndRef = useRef(null);

  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages([...messages, { sender: "user", text: userMsg }]);
    setInput("");

    try {
      const res = await axios.post("/chatbot", { query: userMsg });
      const botMsg = res.data.response;

      setMessages((prev) => [...prev, { sender: "bot", text: botMsg }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong." }
      ]);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      <div className="chatbot-launcher" onClick={() => setOpen(!open)}>
        💬
      </div>

      {open && (
        <div className="chatbot-window">

          <div className="chatbot-header">
            <div className="cb-header-left">
              <div className="cb-avatar">EB</div>
              <div>
                <div className="cb-title">ElectroBot</div>
                <div className="cb-sub">Support • Online</div>
              </div>
            </div>

            <span className="cb-close" onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="chatbot-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.sender === "user" ? "chat-user" : "chat-bot"}`}>
                {msg.text}
              </div>
            ))}
            <div ref={msgEndRef}></div>
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chat-send-btn" onClick={sendMessage}>➤</button>
          </div>

        </div>
      )}
    </>
  );
}
