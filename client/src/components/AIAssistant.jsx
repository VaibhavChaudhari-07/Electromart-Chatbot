import React, { useState } from "react";

export default function AIAssistant() {
  const [conversations, setConversations] = useState([
    { id: 1, title: "New Chat", messages: [] },
  ]);
  const [activeConvId, setActiveConvId] = useState(1);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message
    const updatedConvs = conversations.map((c) => {
      if (c.id === activeConvId) {
        return {
          ...c,
          messages: [...c.messages, { role: "user", text: userInput }],
        };
      }
      return c;
    });
    setConversations(updatedConvs);
    setUserInput("");

    // Simulate bot response
    setLoading(true);
    setTimeout(() => {
      setConversations((prevConvs) =>
        prevConvs.map((c) => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  role: "assistant",
                  text: "This is a placeholder response. AI logic will be implemented soon!",
                },
              ],
            };
          }
          return c;
        })
      );
      setLoading(false);
    }, 500);
  };

  const createNewConversation = () => {
    const newId = Math.max(...conversations.map((c) => c.id), 0) + 1;
    setConversations([
      ...conversations,
      { id: newId, title: "New Chat", messages: [] },
    ]);
    setActiveConvId(newId);
  };

  const deleteConversation = (id) => {
    if (conversations.length === 1) {
      alert("You must keep at least one conversation");
      return;
    }
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    setActiveConvId(filtered[0].id);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Conversation List Sidebar */}
      <div className="w-64 bg-gradient-to-b from-primary to-primary-dark rounded-xl p-4 space-y-3 shadow-lg flex flex-col">
        <button
          onClick={createNewConversation}
          className="w-full bg-white text-primary font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-md"
        >
          + New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                activeConvId === conv.id
                  ? "bg-white text-primary shadow-lg"
                  : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
              }`}
              onClick={() => setActiveConvId(conv.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold truncate">
                  {conv.messages.length > 0
                    ? conv.messages[0].text.substring(0, 20) + "..."
                    : "New Chat"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-lg"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs opacity-75 mt-1">
                {conv.messages.length} messages
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg p-6">
        {/* Chat Header */}
        <div className="pb-4 border-b border-gray-200 mb-4">
          <h3 className="text-2xl font-bold text-gray-900">🤖 AI Assistant</h3>
          <p className="text-sm text-gray-600 mt-1">
            Ask questions about products, orders, and more!
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {activeConv?.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-semibold">Start a conversation!</p>
                <p className="text-sm mt-1">Ask me about products, orders, or anything else.</p>
              </div>
            </div>
          ) : (
            activeConv?.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-xl shadow-md ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-xl shadow-md">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: ".2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: ".4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="input-field flex-1"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading}
            className="btn-primary px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
