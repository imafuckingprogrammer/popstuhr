'use client'

import { useState } from 'react'
import { MessageSquare, X, Send, Flame } from 'lucide-react'
import type { Widget } from '@/lib/types'

interface Props {
  widget: Widget
}

export function WidgetPreview({ widget }: Props) {
  const [open, setOpen] = useState(true)

  const {
    primary_color = '#DC2626',
    bg_color = '#ffffff',
    bot_name = 'Support',
    welcome_message = 'Hi! How can I help you today?',
    placeholder = 'Type a message...',
    show_branding = true,
    position = 'bottom-right',
    font_family = 'Inter',
  } = widget

  const fontStyle = { fontFamily: font_family === 'mono' ? 'monospace' : font_family }

  return (
    <div
      className="relative rounded-xl border bg-muted/20 overflow-hidden"
      style={{ height: 520, ...fontStyle }}
    >
      <div className="absolute inset-0 flex items-end p-4" style={{
        justifyContent: position === 'bottom-left' ? 'flex-start' : 'flex-end',
        flexDirection: 'column',
        alignItems: position === 'bottom-left' ? 'flex-start' : 'flex-end',
      }}>
        {/* Chat window */}
        {open && (
          <div
            className="mb-3 flex flex-col rounded-2xl shadow-xl overflow-hidden"
            style={{
              width: 320,
              height: 420,
              backgroundColor: bg_color,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5"
              style={{ backgroundColor: primary_color }}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{bot_name.slice(0, 1)}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{bot_name}</p>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                    <span className="text-white/80 text-[10px]">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Welcome bubble */}
              <div className="flex items-end gap-2">
                <div
                  className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: primary_color }}
                >
                  <span className="text-[9px] font-bold text-white">{bot_name.slice(0, 1)}</span>
                </div>
                <div
                  className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-xs max-w-[220px]"
                  style={{
                    backgroundColor: `${primary_color}14`,
                    color: '#111',
                  }}
                >
                  {welcome_message}
                </div>
              </div>

              {/* Sample user message */}
              <div className="flex justify-end">
                <div
                  className="rounded-2xl rounded-br-sm px-3.5 py-2.5 text-xs text-white max-w-[200px]"
                  style={{ backgroundColor: primary_color }}
                >
                  What are your hours?
                </div>
              </div>

              {/* Sample bot response */}
              <div className="flex items-end gap-2">
                <div
                  className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: primary_color }}
                >
                  <span className="text-[9px] font-bold text-white">{bot_name.slice(0, 1)}</span>
                </div>
                <div
                  className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-xs max-w-[220px]"
                  style={{
                    backgroundColor: `${primary_color}14`,
                    color: '#111',
                  }}
                >
                  We&apos;re open Monday–Friday 9am–6pm and Saturday 10am–4pm.
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-black/5">
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
                style={{ borderColor: 'rgba(0,0,0,0.1)' }}
              >
                <span className="text-xs text-gray-400 flex-1 truncate">{placeholder}</span>
                <button
                  className="h-6 w-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: primary_color }}
                >
                  <Send className="h-3 w-3 text-white" />
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

        {/* Bubble button */}
        <button
          onClick={() => setOpen(!open)}
          className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: primary_color }}
        >
          {open
            ? <X className="h-5 w-5 text-white" />
            : <MessageSquare className="h-5 w-5 text-white" />
          }
        </button>
      </div>
    </div>
  )
}
