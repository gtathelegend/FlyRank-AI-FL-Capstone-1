"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSparkles,
  faXmark,
  faPaperPlane,
  faRotateRight,
  faRobot,
  faUser,
  faMessage,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const SUGGESTED_PROMPTS = [
  "Who is Vedaang?",
  "Tell me about Aegis Care.",
  "Explain Posture Sense.",
  "What backend technologies does he use?",
  "What research has he published?",
  "Internship experience?",
  "Certifications?",
  "Resume?",
  "Contact?",
];

export default function AskVedaang({ embedded = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am **Ask Vedaang**, an AI assistant built to help you learn about Vedaang Sharma's engineering work, research, backend skills, and career journey.\n\nClick a suggested question below or type your own!",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen || embedded) {
      scrollToBottom();
    }
  }, [messages, isOpen, embedded]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || isStreaming) return;

    setInput("");
    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) throw new Error("Failed to reach Ask Vedaang server.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantResponse += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantResponse,
          };
          return updated;
        });
      }

      if (!assistantResponse.trim()) {
        const fallbackMsg = "I am **Ask Vedaang**, an AI assistant for Vedaang Sharma's portfolio. Try asking about his [projects](/projects), [research](/research), or [skills](/skills)!";
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: fallbackMsg,
          };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an issue retrieving that information. Please try again or reach out on the [Contact Page](/contact).",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation reset. Ask me anything about Vedaang's projects, technical stack, or research!",
      },
    ]);
  };

  const chatContent = (
    <div className="flex flex-col h-full bg-[#F7F5DC] dark:bg-[#141310] text-[#181713] dark:text-[#F7F5DC]">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3DEC3] dark:border-[#33312B] bg-[#F0EDD4] dark:bg-[#1C1B17]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFC233] text-[#181713] flex items-center justify-center font-bold">
            <FontAwesomeIcon icon={faRobot} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg leading-none">Ask Vedaang</h2>
            <span className="text-[11px] font-mono text-[#FF8A00] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Grounded AI Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-[#57534E] dark:text-[#9E9A8B] hover:bg-[#E3DEC3]/60 dark:hover:bg-[#2A2923] transition"
            title="Reset conversation"
          >
            <FontAwesomeIcon icon={faRotateRight} className="text-sm" />
          </button>
          {!embedded && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-[#57534E] dark:text-[#9E9A8B] hover:bg-[#E3DEC3]/60 dark:hover:bg-[#2A2923] transition"
            >
              <FontAwesomeIcon icon={faXmark} className="text-base" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Prompts Banner */}
      <div className="px-4 py-3 bg-[#FAF8EC] dark:bg-[#1E1D19] border-b border-[#E3DEC3]/60 dark:border-[#33312B]/60 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#787467] shrink-0">
            Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={isStreaming}
              className="shrink-0 text-xs font-mono px-3 py-1 rounded-full bg-[#F0EDD4] dark:bg-[#25241E] border border-[#E3DEC3] dark:border-[#33312B] hover:border-[#FFC233] text-[#181713] dark:text-[#F7F5DC] transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-md bg-[#FFC233] text-[#181713] flex items-center justify-center shrink-0 text-xs mt-1">
                <FontAwesomeIcon icon={faRobot} />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#181713] text-[#F7F5DC] dark:bg-[#F7F5DC] dark:text-[#181713] rounded-br-none"
                  : "bg-[#F0EDD4] dark:bg-[#1E1D19] border border-[#E3DEC3] dark:border-[#33312B] text-[#181713] dark:text-[#F7F5DC] rounded-bl-none shadow-subtle"
              }`}
            >
              {msg.role === "user" ? (
                <p>{msg.content}</p>
              ) : (
                <div className="md-content">
                  <MarkdownRenderer content={msg.content || "..."} />
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-md bg-[#FF8A00] text-white flex items-center justify-center shrink-0 text-xs mt-1">
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}
          </div>
        ))}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#787467] pl-10">
            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-[#FF8A00]" />
            Ask Vedaang is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 bg-[#F0EDD4] dark:bg-[#1C1B17] border-t border-[#E3DEC3] dark:border-[#33312B]"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Aegis Care, backend stack, research, experience..."
            disabled={isStreaming}
            className="flex-1 rounded-xl bg-[#FAF8EC] dark:bg-[#141310] border border-[#E3DEC3] dark:border-[#33312B] px-4 py-3 text-sm text-[#181713] dark:text-[#F7F5DC] placeholder-[#9E9A8B] focus:outline-none focus:ring-2 focus:ring-[#FFC233]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-3 rounded-xl bg-[#181713] text-[#F7F5DC] dark:bg-[#F7F5DC] dark:text-[#181713] font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </form>
    </div>
  );

  if (embedded) {
    return <div className="w-full h-[75vh] rounded-2xl overflow-hidden border border-[#E3DEC3] dark:border-[#33312B] shadow-editorial">{chatContent}</div>;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-[80] flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#181713] text-[#F7F5DC] dark:bg-[#F7F5DC] dark:text-[#181713] shadow-hover border border-[#FFC233] hover:scale-105 transition-transform"
        aria-label="Ask Vedaang AI Assistant"
      >
        <FontAwesomeIcon icon={faMessage} className="text-[#FFC233] dark:text-[#FF8A00]" />
        <span className="font-heading font-bold text-xs tracking-wide">Ask Vedaang</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </motion.button>

      {/* Slide-over Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-lg h-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {chatContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
