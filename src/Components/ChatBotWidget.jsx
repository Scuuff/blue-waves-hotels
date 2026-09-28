import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { getBotReply, GREETING_REPLY } from "../utils/chatEngine";
import { getSafeRoomImage } from "../utils/roomMedia";

const EASE = [0.22, 1, 0.36, 1];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[#eef3f9] px-4 py-3 dark:bg-white/[0.06]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className="h-1.5 w-1.5 rounded-full bg-gold-500"
        />
      ))}
    </div>
  );
}

function ChipRow({ chips, onSend }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {chips.map((chip) =>
        chip.send ? (
          <button
            key={chip.label}
            onClick={() => onSend(chip.send)}
            className="rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1.5 text-xs font-semibold text-gold-600 transition-colors hover:bg-gold-400/20 dark:text-gold-300"
          >
            {chip.label}
          </button>
        ) : chip.to ? (
          <Link
            key={chip.label}
            to={chip.to}
            className="rounded-full border border-[#dfe8f2] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d3252] transition-colors hover:border-gold-400/50 hover:text-gold-600 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:text-gold-300"
          >
            {chip.label}
          </Link>
        ) : (
          <a
            key={chip.label}
            href={chip.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#dfe8f2] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d3252] transition-colors hover:border-gold-400/50 hover:text-gold-600 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:text-gold-300"
          >
            {chip.label}
          </a>
        )
      )}
    </div>
  );
}

function RoomResults({ rooms }) {
  return (
    <div className="mt-2 space-y-2">
      {rooms.map((room) => (
        <Link
          key={room._id || room.id}
          to="/booking"
          state={{ room }}
          className="flex items-center gap-3 rounded-2xl border border-[#e3ebf4] bg-white p-2.5 transition-colors hover:border-gold-400/50 dark:border-white/10 dark:bg-white/[0.04]"
        >
          <img
            src={getSafeRoomImage(room)}
            alt={room.roomName}
            onError={(e) => {
              e.currentTarget.src = getSafeRoomImage({ type: room.type });
            }}
            className="h-12 w-14 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#1d3252] dark:text-white">
              {room.roomName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-white/50">
              {room.branch}
            </p>
          </div>
          <p className="shrink-0 font-serif text-base font-semibold text-gold-600 dark:text-gold-300">
            ${room.price}
          </p>
        </Link>
      ))}
    </div>
  );
}

function BranchResults({ branches }) {
  return (
    <div className="mt-2 space-y-2">
      {branches.map((branch) => (
        <div
          key={branch.name}
          className="rounded-2xl border border-[#e3ebf4] bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]"
        >
          <p className="text-sm font-semibold text-[#1d3252] dark:text-white">
            {branch.name}
          </p>
          <div className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-white/60">
            <p className="flex items-center gap-1.5">
              <MapPin size={12} className="shrink-0 text-gold-500" />
              {branch.address}
            </p>
            <p className="flex items-center gap-1.5">
              <Phone size={12} className="shrink-0 text-gold-500" />
              {branch.phone}
            </p>
            <p className="flex items-center gap-1.5">
              <Mail size={12} className="shrink-0 text-gold-500" />
              {branch.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChatBotWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Greet once, the first time the panel opens.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "bot", ...GREETING_REPLY }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const sendMessage = async (raw) => {
    const text = raw.trim();
    if (!text || typing) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setTyping(true);

    const [reply] = await Promise.all([
      getBotReply(text),
      // Short pause so replies feel conversational rather than instant.
      new Promise((resolve) => setTimeout(resolve, 550)),
    ]);

    setTyping(false);
    setMessages((prev) => [...prev, { role: "bot", ...reply }]);
  };

  // Keep the concierge out of the admin panel.
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Launcher */}
      <motion.button
        onClick={() => setOpen((current) => !current)}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        aria-label={open ? "Close chat" : "Chat with Blue Wave concierge"}
        className="fixed bottom-5 right-5 z-[110] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#28415f] to-[#182c46] text-gold-300 shadow-[0_14px_34px_rgba(15,30,60,0.4)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X size={22} /> : <MessageSquare size={22} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-24 right-4 z-[110] flex h-[min(70vh,560px)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_80px_rgba(15,30,60,0.28)] sm:right-5 sm:w-[380px] dark:border-white/10 dark:bg-[#0f1f33] dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-br from-[#28415f] to-[#182c46] px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-gold-300">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg font-semibold leading-tight text-white">
                  Blue Wave Concierge
                </p>
                <p className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online — instant answers
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={message.role === "user" ? "flex justify-end" : ""}
                >
                  {message.role === "user" ? (
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#28415f] to-[#182c46] px-4 py-2.5 text-sm leading-relaxed text-white">
                      {message.text}
                    </div>
                  ) : (
                    <div className="max-w-[92%]">
                      <div className="rounded-2xl rounded-bl-md bg-[#eef3f9] px-4 py-2.5 text-sm leading-relaxed text-[#1d3252] dark:bg-white/[0.06] dark:text-white/85">
                        {message.text}
                      </div>
                      {message.rooms && <RoomResults rooms={message.rooms} />}
                      {message.branches && (
                        <BranchResults branches={message.branches} />
                      )}
                      {message.chips && (
                        <ChipRow chips={message.chips} onSend={sendMessage} />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex"
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-[#eef3f9] p-3 dark:border-white/10"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your stay…"
                aria-label="Chat message"
                className="min-w-0 flex-1 rounded-2xl border border-[#dfe8f2] bg-white/80 px-4 py-2.5 text-sm text-[#1d3252] placeholder-[#8fa3bd] outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-white/35"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.88 }}
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#28415f] to-[#182c46] text-gold-300 transition-opacity disabled:opacity-40"
              >
                <Send size={16} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
