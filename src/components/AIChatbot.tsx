'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, HelpCircle, CornerDownLeft, RefreshCw } from 'lucide-react';
import styles from './AIChatbot.module.css';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  '⚡ How to download YouTube in 1080p?',
  '📱 How to download Facebook Reels?',
  '🎵 Can I convert video to MP3 audio?',
  '🔒 Is MediaKit safe & free?',
  '⚠️ What if my link fails to download?',
];

// Smart contextual knowledge engine for MediaKit AI
function getAIResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('youtube') || q.includes('1080p') || q.includes('4k') || q.includes('yt')) {
    return '🎬 **Downloading YouTube on MediaKit:**\n1. Copy the public YouTube video or Short URL.\n2. Paste it into the search bar above.\n3. MediaKit auto-detects the platform in milliseconds.\n4. Select your preferred quality (1080p HD, 720p, or MP3) and click Download!\n\n💡 *Tip: We pre-warm YouTube conversions in the background to deliver maximum speed!*';
  }

  if (q.includes('facebook') || q.includes('fb') || q.includes('reel')) {
    return '📱 **Downloading Facebook Reels & Videos:**\n1. Copy the link from Facebook (Reel, Watch, or Public Post).\n2. Paste it into the input bar.\n3. MediaKit automatically extracts the direct HD (1080p) or SD video stream and clean audio.\n4. Click "Download" to save directly to your phone or PC without watermarks!';
  }

  if (q.includes('mp3') || q.includes('audio') || q.includes('song') || q.includes('music')) {
    return '🎵 **Extracting MP3 Audio:**\nYes! For YouTube, Facebook, and other platforms, MediaKit provides an **Original Audio (MP3)** format option.\nSimply paste the URL, look for the **MP3** section under "Available Downloads", and click Download.';
  }

  if (q.includes('tiktok') || q.includes('watermark')) {
    return '✨ **Downloading TikTok Videos:**\nMediaKit allows you to download public TikTok videos in crisp HD without any intrusive watermark. Just paste the TikTok link into the box above!';
  }

  if (q.includes('instagram') || q.includes('insta') || q.includes('ig')) {
    return '📸 **Downloading Instagram Content:**\nPaste any public Instagram Reel or Post link. MediaKit fetches the direct MP4 source ready for instant high-speed download.';
  }

  if (q.includes('free') || q.includes('cost') || q.includes('money') || q.includes('safe') || q.includes('virus')) {
    return '🛡️ **100% Free & Safe:**\nMediaKit is completely free to use with no hidden fees, subscriptions, or account requirements. We do not host viruses, inject malware, or store your personal browsing data.';
  }

  if (q.includes('fail') || q.includes('error') || q.includes('not working') || q.includes('problem')) {
    return '⚠️ **Troubleshooting Common Link Issues:**\n- **Private Content:** MediaKit strictly respects privacy and cannot download private account posts or friends-only videos.\n- **Link Format:** Make sure the URL starts with `https://` and points directly to the video.\n- **Deleted Media:** Ensure the original video hasn\'t been taken down by the author.';
  }

  return '🤖 **MediaKit Assistant:**\nI can help you with anything related to MediaKit!\n\n• Downloading from YouTube, Facebook, TikTok, & Instagram\n• Choosing 1080p HD vs 720p\n• Extracting MP3 Audio\n• Troubleshooting links\n\nFeel free to ask a specific question or click one of the quick suggestions above!';
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 Hi there! I am your **MediaKit AI Assistant**.\nHow can I help you download or convert videos today?',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = getAIResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: '👋 Hi there! I am your **MediaKit AI Assistant**.\nHow can I help you download or convert videos today?',
        time: 'Just now',
      },
    ]);
  };

  return (
    <div className={styles.chatbotRoot}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className={styles.launcherBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Open MediaKit AI Assistant"
          title="Ask MediaKit AI"
        >
          <div className={styles.launcherGlow} />
          <div className={styles.launcherIconBox}>
            <Sparkles size={18} className={styles.sparkleIcon} />
            <Bot size={22} className={styles.botIcon} />
          </div>
          <span className={styles.launcherText}>AI Help</span>
          <span className={styles.onlineDot} />
        </button>
      )}

      {/* Chat Popover Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.avatarBox}>
                <Bot size={20} />
                <span className={styles.avatarOnlineDot} />
              </div>
              <div>
                <h3 className={styles.assistantTitle}>MediaKit AI Assistant</h3>
                <span className={styles.assistantStatus}>Online &bull; Instant Help</span>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.iconAction}
                onClick={handleClearChat}
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="button"
                className={styles.iconAction}
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick suggestions scroll */}
          <div className={styles.quickChipsWrapper}>
            <div className={styles.quickChipsTrack}>
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.chipBtn}
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className={styles.messagesContainer}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.messageWrapper} ${
                  m.sender === 'user' ? styles.msgUser : styles.msgBot
                }`}
              >
                <div className={styles.messageBubble}>
                  <div className={styles.messageBody}>
                    {m.text.split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx < m.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className={styles.messageTime}>{m.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.messageWrapper} ${styles.msgBot}`}>
                <div className={`${styles.messageBubble} ${styles.typingBubble}`}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className={styles.inputArea}>
            <input
              type="text"
              placeholder="Ask anything about downloading..."
              className={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
