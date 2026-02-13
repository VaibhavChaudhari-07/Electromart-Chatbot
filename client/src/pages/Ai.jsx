import React, { useEffect, useState, useRef } from "react";
import axios from "../api/axiosClient";
import { useUser } from "../context/UserContext";
import { useAdmin } from "../context/AdminContext";

export default function Ai() {
  const { user } = useUser();
  const { admin } = useAdmin();
  const currentUser = user || admin;

  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Load chats from server on mount
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("/chatbot/chats/all");
        const fetchedChats = res.data || [];
        setChats(fetchedChats);
        if (fetchedChats.length > 0) {
          setActiveId(fetchedChats[0]._id);
        }
      } catch (err) {
        console.error("Error loading chats:", err);
        // Try localStorage as fallback
        try {
          const cached = JSON.parse(localStorage.getItem(`ai_chats_${currentUser.id}`) || "[]");
          setChats(cached);
          if (cached.length > 0) setActiveId(cached[0].id);
        } catch {}
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [currentUser]);

  // Load messages when activeId changes
  useEffect(() => {
    if (activeId) {
      const c = chats.find((x) => x._id === activeId);
      setMessages(c?.messages || []);
    } else {
      setMessages([]);
    }
  }, [activeId, chats]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const newChat = async () => {
    try {
      const res = await axios.post("/chatbot/chats/create", {
        title: `Chat ${new Date().toLocaleString()}`,
      });
      const newChat = res.data;
      setChats([newChat, ...chats]);
      setActiveId(newChat._id);
      setMessages([]);
    } catch (err) {
      console.error("Error creating chat:", err);
      alert("Failed to create chat");
    }
  };

  const deleteChat = async (id) => {
    try {
      await axios.delete(`/chatbot/chats/delete/${id}`);
      const next = chats.filter((c) => c._id !== id);
      setChats(next);
      if (activeId === id) {
        setActiveId(next[0]?._id || null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Failed to delete chat");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending || !activeId) return;
    setIsSending(true);

    const userMsg = { sender: "user", text: input, ts: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");

    try {
      // Save user message to server
      await axios.put(`/chatbot/chats/update/${activeId}`, { messages: updated });

      // Get bot response
      const res = await axios.post("/chatbot", { query: userMsg.text });
      const botMsg = {
        sender: "bot",
        text: res.data.response || "(no response)",
        ts: Date.now(),
      };
      const updated2 = [...updated, botMsg];
      setMessages(updated2);

      // Save bot response to server
      await axios.put(`/chatbot/chats/update/${activeId}`, { messages: updated2 });

      // Update local chat list
      setChats(chats.map((c) => (c._id === activeId ? { ...c, messages: updated2 } : c)));
    } catch (err) {
      const errMsg = {
        sender: "bot",
        text: "Error: failed to get response.",
        ts: Date.now(),
      };
      const updated2 = [...updated, errMsg];
      setMessages(updated2);

      // Try to save error to server
      try {
        await axios.put(`/chatbot/chats/update/${activeId}`, { messages: updated2 });
      } catch (saveErr) {
        console.error("Error saving to server:", saveErr);
      }

      console.error("Error sending message:", err);
    }

    setIsSending(false);
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary/5 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access AI Assistant chat history.</p>
          <p className="text-sm text-gray-500">Your chat history is private and specific to your account.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary/5 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary/5 to-gray-50">
      <div className="h-screen flex gap-0">
        {/* Chat History Sidebar - Collapsible */}
        <div
          className={`transition-all duration-300 ${
            isHistoryOpen ? "w-full lg:w-80" : "w-0 lg:w-20"
          } bg-white border-r border-gray-200 shadow-lg flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-dark">
            <div className="flex items-center justify-between">
              {isHistoryOpen && (
                <>
                  <h3 className="font-bold text-white">💬 Chats</h3>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="text-white hover:bg-white/20 p-1 rounded"
                  >
                    ✕
                  </button>
                </>
              )}
              {!isHistoryOpen && (
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="text-primary hover:bg-gray-100 p-2 rounded w-full"
                  title="Show chats"
                >
                  ◀
                </button>
              )}
            </div>
            {isHistoryOpen && (
              <button
                onClick={newChat}
                className="w-full mt-2 bg-white text-primary px-3 py-2 rounded font-semibold text-sm hover:bg-gray-100"
              >
                ➕ New Chat
              </button>
            )}
          </div>

          {/* Chat List */}
          {isHistoryOpen && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chats.length === 0 && (
                <div className="text-sm text-gray-600 text-center py-4">
                  No chats yet — start a new chat.
                </div>
              )}
              {chats.map((c) => (
                <div
                  key={c._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all group ${
                    activeId === c._id
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md"
                      : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div onClick={() => setActiveId(c._id)}>
                    <div className="font-semibold text-sm truncate">{c.title}</div>
                    <div
                      className={`text-xs ${
                        activeId === c._id ? "text-white/70" : "text-gray-500"
                      } truncate`}
                    >
                      {c.messages?.slice(-1)[0]?.text?.slice(0, 50) || "No messages"}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(c._id);
                    }}
                    className="text-xs mt-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    ElectroMart AI Assistant
                  </h2>
                  <p className="text-gray-600">
                    Ask me anything about our products, pricing, or features!
                  </p>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white rounded-3xl rounded-tr-none"
                      : "bg-gray-100 text-gray-900 rounded-3xl rounded-tl-none"
                  } px-4 py-3 shadow-sm`}
                >
                  <p className="text-sm lg:text-base break-words">{m.text}</p>
                  <div
                    className={`text-xs mt-1 ${
                      m.sender === "user" ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {formatTime(m.ts)}
                  </div>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-3xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar - Sticky at Bottom */}
          <div className="border-t border-gray-200 bg-white p-4 sticky bottom-0 shadow-lg">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask the AI about products, pricing, or features..."
                className="flex-1 border-2 border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-primary transition-colors"
                disabled={isSending || !activeId}
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !input.trim() || !activeId}
                className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full px-6 py-3 font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSending ? "..." : "Send"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Use Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
