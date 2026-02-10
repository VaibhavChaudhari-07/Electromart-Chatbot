import React, { createContext, useContext, useState } from "react";

const ChatbotContext = createContext();

export function ChatbotProvider({ children }) {
  const [open, setOpen] = useState(false);

  const toggleChatbot = () => setOpen(!open);
  const closeChatbot = () => setOpen(false);

  return (
    <ChatbotContext.Provider value={{ open, toggleChatbot, closeChatbot }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export const useChatbot = () => useContext(ChatbotContext);
