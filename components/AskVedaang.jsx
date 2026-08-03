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
  faFolder,
  faFileCode,
  faLayerGroup,
  faCircleExclamation,
  faTrash,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const CATEGORIZED_PROMPTS = {
  Featured: [
    "Tell me about yourself",
    "Show your best project",
    "Explain Posture Sense",
    "How did you build your portfolio?",
  ],
  Projects: [
    "Explain Posture Sense",
    "Tell me about Aegis Care",
    "What projects have you built?",
  ],
  "Tech & AI": [
    "What technologies do you enjoy using?",
    "Tell me about your research",
    "Show your certifications",
  ],
  Experience: [
    "What internship experience do you have?",
    "Resume & CV PDF",
    "How to contact Vedaang?",
  ],
};

const INITIAL_WELCOME = {
  role: "assistant",
  content:
    "Hi! 👋\n\nI'm Vedaang.\n\nThanks for visiting my portfolio. I'm happy to answer questions about my projects, backend engineering work, AI research, internships, technical skills, certifications, or anything else you'd like to know.\n\nWhat would you like to explore?",
  bypassRag: true,
  retrievedCount: 0,
  confidenceLevel: "None",
  confidenceScore: 0,
};

/**
 * Parses markdown text to extract cited projects and research papers for rich interactive cards
 */
function extractCitationsAndCards(content) {
  if (!content || typeof content !== "string") return { projects: [], research: [] };

  const projectRegex = /\[([^\]]+)\]\(\/projects\/([^)]+)\)/g;
  const researchRegex = /\[([^\]]+)\]\(\/research([^)]*)\)/g;

  const projects = [];
  let pMatch;
  while ((pMatch = projectRegex.exec(content)) !== null) {
    if (!projects.some((p) => p.slug === pMatch[2])) {
      projects.push({ title: pMatch[1], slug: pMatch[2], url: `/projects/${pMatch[2]}` });
    }
  }

  const research = [];
  let rMatch;
  while ((rMatch = researchRegex.exec(content)) !== null) {
    if (!research.some((r) => r.title === rMatch[1])) {
      research.push({ title: rMatch[1], url: `/research${rMatch[2]}` });
    }
  }

  return { projects, research };
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F0EDD4] dark:bg-[#1E1D19] border border-[#E3DEC3] dark:border-[#33312B] w-fit shadow-subtle">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-[#FF8A00] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-[#FFC233] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-[#FF8A00] animate-bounce" />
      </div>
      <span className="text-xs font-mono text-[#787467] dark:text-[#9E9A8B]">
        Vedaang is typing...
      </span>
    </div>
  );
}

function ProjectCardLink({ title, slug, url }) {
  const targetUrl = url || `/projects/${slug}`;
  return (
    <a
      href={targetUrl}
      className="group flex items-center justify-between p-3 my-2 rounded-xl bg-[#FAF8EC] dark:bg-[#141310] border border-[#E3DEC3] dark:border-[#33312B] hover:border-[#FFC233] dark:hover:border-[#FFC233] transition shadow-subtle text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#FFC233]/20 text-[#FF8A00] flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform shrink-0">
          <FontAwesomeIcon icon={faFolder} />
        </div>
        <div>
          <h4 className="font-heading font-bold text-xs text-[#181713] dark:text-[#F7F5DC] group-hover:text-[#FF8A00] transition-colors">
            {title}
          </h4>
          <span className="text-[10px] font-mono text-[#787467] dark:text-[#9E9A8B]">
            View Case Study & Architecture →
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold text-[#FF8A00] group-hover:translate-x-1 transition-transform shrink-0 ml-2">
        Explore →
      </span>
    </a>
  );
}

function ResearchCardLink({ title, url }) {
  return (
    <a
      href={url || "/research"}
      className="group flex items-center justify-between p-3 my-2 rounded-xl bg-[#FAF8EC] dark:bg-[#141310] border border-[#E3DEC3] dark:border-[#33312B] hover:border-[#FF8A00] dark:hover:border-[#FF8A00] transition shadow-subtle text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#FF8A00]/20 text-[#FF8A00] flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform shrink-0">
          <FontAwesomeIcon icon={faFileCode} />
        </div>
        <div>
          <h4 className="font-heading font-bold text-xs text-[#181713] dark:text-[#F7F5DC] group-hover:text-[#FF8A00] transition-colors">
            {title}
          </h4>
          <span className="text-[10px] font-mono text-[#787467] dark:text-[#9E9A8B]">
            Read Published Research Paper →
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold text-[#FF8A00] group-hover:translate-x-1 transition-transform shrink-0 ml-2">
        Read →
      </span>
    </a>
  );
}

function GroundingConfidenceBadge({ confidenceLevel, confidenceScore, retrievedCount, bypassRag }) {
  // Hide grounding badge if RAG was bypassed or no documents were retrieved
  if (bypassRag || !retrievedCount || retrievedCount === 0 || !confidenceLevel || confidenceLevel === "None") {
    return null;
  }

  const scorePct = Math.round((confidenceScore || 0) * 100);

  if (confidenceLevel === "High") {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 w-fit mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>High Confidence Match ({scorePct}%)</span>
      </div>
    );
  }

  if (confidenceLevel === "Medium") {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 w-fit mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>Medium Confidence Match ({scorePct}%)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-stone-500/10 text-stone-700 dark:text-stone-400 border border-stone-500/20 w-fit mb-2">
      <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
      <span>Low Confidence Match ({scorePct}%)</span>
    </div>
  );
}

function ErrorRecoveryCard({ onRetry, query }) {
  return (
    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2">
      <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
        <FontAwesomeIcon icon={faCircleExclamation} />
        <span>Network Error / Unable to reach server</span>
      </div>
      <p className="text-[11px] leading-relaxed">
        Failed to stream response. Click below to retry your query.
      </p>
      {onRetry && query && (
        <button
          onClick={() => onRetry(query)}
          className="px-3 py-1.5 rounded-lg bg-[#FF8A00] text-white font-semibold text-xs hover:opacity-90 transition flex items-center gap-1.5"
        >
          <FontAwesomeIcon icon={faRotateRight} /> Retry Query
        </button>
      )}
    </div>
  );
}

export default function AskVedaang({ embedded = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ask_vedaang_history_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save chat history to localStorage on update
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem("ask_vedaang_history_v2", JSON.stringify(messages));
      }
    } catch {
      // Ignore storage errors
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen || embedded) {
      scrollToBottom();
    }
  }, [messages, isStreaming, isOpen, embedded]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    setInput("");
    setHasError(false);
    setLastQuery(query);

    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) throw new Error(`Server returned status ${response.status}`);

      const bypassRag = response.headers.get("x-rag-bypass") === "true";
      const confidenceScore = parseFloat(response.headers.get("x-rag-confidence-score") || "0");
      const confidenceLevel = response.headers.get("x-rag-confidence-level") || "None";
      const retrievedCount = parseInt(response.headers.get("x-rag-retrieved-count") || "0", 10);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      // Add empty assistant response to stream into
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          bypassRag,
          confidenceScore,
          confidenceLevel,
          retrievedCount,
        },
      ]);

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
            bypassRag,
            confidenceScore,
            confidenceLevel,
            retrievedCount,
          };
          return updated;
        });
      }

      if (!assistantResponse.trim()) {
        const fallbackMsg =
          "I don't currently have that information documented in my portfolio. Feel free to explore my [projects](/projects), [published research](/research), [skills](/skills), or reach out on my [Contact Page](/contact).";
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: fallbackMsg,
            bypassRag: true,
            confidenceScore: 0,
            confidenceLevel: "None",
            retrievedCount: 0,
          };
          return updated;
        });
      }
    } catch (err) {
      console.error("[AskVedaang] Chat stream error:", err);
      setHasError(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          isError: true,
          content: "Sorry, I encountered a communication issue retrieving context.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_WELCOME]);
    setHasError(false);
    setLastQuery("");
    try {
      localStorage.removeItem("ask_vedaang_history_v2");
    } catch {}
  };

  const chatContent = (
    <div className="flex flex-col h-full bg-[#F7F5DC] dark:bg-[#141310] text-[#181713] dark:text-[#F7F5DC]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E3DEC3] dark:border-[#33312B] bg-[#F0EDD4] dark:bg-[#1C1B17]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFC233] text-[#181713] flex items-center justify-center font-bold text-sm shadow-subtle">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base leading-none">Vedaang</h2>
            <span className="text-[10px] font-mono text-[#FF8A00] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Software Developer & AI Researcher
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-[#57534E] dark:text-[#9E9A8B] hover:bg-[#E3DEC3]/60 dark:hover:bg-[#2A2923] transition flex items-center gap-1 text-xs font-mono"
            title="Clear Chat History"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
            <span className="hidden sm:inline">Clear</span>
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

      {/* Categorized Suggested Prompts Banner */}
      <div className="px-4 py-2.5 bg-[#FAF8EC] dark:bg-[#1E1D19] border-b border-[#E3DEC3]/60 dark:border-[#33312B]/60 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px] font-mono">
          <FontAwesomeIcon icon={faLightbulb} className="text-[#FF8A00] shrink-0 mr-1" />
          {Object.keys(CATEGORIZED_PROMPTS).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-md transition shrink-0 ${
                activeCategory === cat
                  ? "bg-[#181713] text-[#F7F5DC] dark:bg-[#F7F5DC] dark:text-[#181713] font-bold"
                  : "bg-[#F0EDD4] dark:bg-[#25241E] text-[#57534E] dark:text-[#9E9A8B] hover:border-[#FFC233]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
          {CATEGORIZED_PROMPTS[activeCategory].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={isStreaming}
              className="shrink-0 text-xs font-mono px-3 py-1 rounded-full bg-[#F0EDD4] dark:bg-[#25241E] border border-[#E3DEC3] dark:border-[#33312B] hover:border-[#FFC233] text-[#181713] dark:text-[#F7F5DC] transition shadow-subtle"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const { projects, research } = !isUser ? extractCitationsAndCards(msg.content) : { projects: [], research: [] };

          return (
            <div
              key={index}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-md bg-[#FFC233] text-[#181713] flex items-center justify-center shrink-0 text-xs mt-1 shadow-subtle">
                  <FontAwesomeIcon icon={faRobot} />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? "bg-[#181713] text-[#F7F5DC] dark:bg-[#F7F5DC] dark:text-[#181713] rounded-br-none shadow-subtle"
                    : "bg-[#F0EDD4] dark:bg-[#1E1D19] border border-[#E3DEC3] dark:border-[#33312B] text-[#181713] dark:text-[#F7F5DC] rounded-bl-none shadow-subtle"
                }`}
              >
                {isUser ? (
                  <p className="font-medium">{msg.content}</p>
                ) : msg.isError ? (
                  <ErrorRecoveryCard onRetry={handleSend} query={lastQuery} />
                ) : (
                  <div>
                    {/* Grounding badge shown ONLY when retrieval actually occurs */}
                    <GroundingConfidenceBadge
                      confidenceLevel={msg.confidenceLevel}
                      confidenceScore={msg.confidenceScore}
                      retrievedCount={msg.retrievedCount}
                      bypassRag={msg.bypassRag}
                    />

                    <MarkdownRenderer content={msg.content || "..."} />

                    {/* Interactive Project Cards */}
                    {projects.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#787467] dark:text-[#9E9A8B] flex items-center gap-1 mb-1">
                          <FontAwesomeIcon icon={faFolder} className="text-[#FF8A00]" />
                          Related Project:
                        </span>
                        {projects.map((p, idx) => (
                          <ProjectCardLink key={idx} title={p.title} slug={p.slug} url={p.url} />
                        ))}
                      </div>
                    )}

                    {/* Interactive Research Cards */}
                    {research.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[#E3DEC3]/60 dark:border-[#33312B]/60">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#787467] dark:text-[#9E9A8B] flex items-center gap-1 mb-1">
                          <FontAwesomeIcon icon={faFileCode} className="text-[#FF8A00]" />
                          Related Research:
                        </span>
                        {research.map((r, idx) => (
                          <ResearchCardLink key={idx} title={r.title} url={r.url} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-md bg-[#FF8A00] text-white flex items-center justify-center shrink-0 text-xs mt-1 shadow-subtle">
                  <FontAwesomeIcon icon={faUser} />
                </div>
              )}
            </div>
          );
        })}

        {isStreaming && (
          <div className="pl-10">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3.5 bg-[#F0EDD4] dark:bg-[#1C1B17] border-t border-[#E3DEC3] dark:border-[#33312B]"
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
            className="px-4 py-3 rounded-xl bg-[#181713] text-[#F7F5DC] dark:bg-[#F7F5DC] dark:text-[#181713] font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition shadow-subtle"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </form>
    </div>
  );

  if (embedded) {
    return (
      <div className="w-full h-[78vh] rounded-2xl overflow-hidden border border-[#E3DEC3] dark:border-[#33312B] shadow-editorial">
        {chatContent}
      </div>
    );
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
        <span className="font-heading font-bold text-xs tracking-wide">Chat with Vedaang</span>
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
