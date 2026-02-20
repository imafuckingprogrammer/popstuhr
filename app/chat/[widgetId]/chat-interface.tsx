'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, Loader2, Flame } from 'lucide-react'
import type { Widget } from '@/lib/types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface Props {
  widget: Widget
}

function getOrCreateVisitorId(): string {
  const key = 'rhcb_visitor_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(key, id)
  }
  return id
}

export function ChatInterface({ widget }: Props) {
  const {
    primary_color,
    bg_color,
    bot_name,
    welcome_message,
    placeholder,
    show_branding,
    font_family,
  } = widget

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: welcome_message },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Notify parent frame when open state changes
  useEffect(() => {
    window.parent.postMessage({ type: 'rhcb:resize', open }, '*')
  }, [open])

  // Listen for open commands from parent
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'rhcb:open') setOpen(true)
      if (e.data?.type === 'rhcb:close') setOpen(false)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const visitorId = getOrCreateVisitorId()
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', streaming: true }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widget_id: widget.id,
          visitor_id: visitorId,
          conversation_id: conversationId,
          message: text,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to get response')
      }

      // Handle streaming
      if (res.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') break
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'conversation_id') {
                    setConversationId(parsed.id)
                  } else if (parsed.type === 'delta') {
                    fullContent += parsed.content
                    setMessages(prev => prev.map(m =>
                      m.id === assistantId
                        ? { ...m, content: fullContent, streaming: true }
                        : m
                    ))
                  }
                } catch { /* skip malformed chunks */ }
              }
            }
          }
        }

        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, streaming: false } : m
        ))
      } else {
        // Non-streaming fallback
        const data = await res.json()
        if (data.conversation_id) setConversationId(data.conversation_id)
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: data.reply, streaming: false } : m
        ))
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong'
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: widget.fallback_message || "I'm having trouble right now. Please try again.", streaming: false }
          : m
      ))
      console.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const fontStyle = { fontFamily: font_family === 'mono' ? 'monospace' : (font_family || 'system-ui') }

  return (
    <div className="h-screen w-full flex flex-col items-end justify-end bg-transparent p-3 sm:p-4" style={fontStyle}>
      {/* Chat window */}
      {open && (
        <div
          className="mb-3 flex flex-col rounded-2xl shadow-2xl overflow-hidden w-full sm:w-80 md:w-96"
          style={{
            height: 480,
            maxHeight: 'calc(100vh - 80px)',
            backgroundColor: bg_color,
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 shrink-0"
            style={{ backgroundColor: primary_color }}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{bot_name.slice(0, 1)}</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{bot_name}</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                  <span className="text-white/80 text-[10px]">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-end gap-2'}`}>
                {msg.role === 'assistant' && (
                  <div
                    className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: primary_color }}
                  >
                    <span className="text-[10px] font-bold text-white">{bot_name.slice(0, 1)}</span>
                  </div>
                )}
                <div
                  className="rounded-2xl px-3.5 py-2.5 text-sm max-w-[260px] leading-relaxed"
                  style={
                    msg.role === 'user'
                      ? { backgroundColor: primary_color, color: '#fff', borderBottomRightRadius: 4 }
                      : { backgroundColor: `${primary_color}14`, color: '#111', borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.content || (msg.streaming && (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-black/5 shrink-0">
            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-2"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: primary_color }}
              >
                {loading
                  ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                  : <Send className="h-3.5 w-3.5 text-white" />
                }
              </button>
            </div>
            {show_branding && (
              <p className="text-center text-[9px] text-gray-400 mt-1.5 flex items-center justify-center gap-1">
                <Flame className="h-2.5 w-2.5" style={{ color: primary_color }} />
                Powered by RedHotChatbot
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bubble */}
      <button
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 100) }}
        className="h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
        style={{ backgroundColor: primary_color }}
      >
        {open
          ? <X className="h-6 w-6 text-white" />
          : <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        }
      </button>
    </div>
  )
}
