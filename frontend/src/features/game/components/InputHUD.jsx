import { useState } from 'react'
import { useVoiceInput } from '../hooks/useVoiceInput'

export default function InputHUD({ onSend, disabled }) {
  const [text, setText] = useState('')
  const { listening, toggleVoice } = useVoiceInput((transcript) => setText(transcript))

  const handleSend = () => {
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
  }

  return (
    <div className="fixed bottom-0 w-full z-50 px-4 pb-6">
      <div className="max-w-4xl mx-auto bg-[#1a1a2e] border-4 border-black border-t-[6px] border-t-[#f59e0b] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 relative">
        <div className="absolute -top-5 left-8 bg-[#f59e0b] px-4 py-1 border-4 border-black -rotate-1">
          <span className="font-bangers text-black text-sm tracking-widest">OFFER INPUT</span>
        </div>
        <div className="flex gap-4 items-end">
          <button
            onClick={toggleVoice}
            className={`w-14 h-14 shrink-0 border-4 border-black flex items-center justify-center text-white transition-all
              ${listening ? 'bg-[#a855f7] animate-pulse' : 'bg-[#a80619] hover:bg-[#ff716a]'}`}
          >
            <span className="material-symbols-outlined text-3xl">mic</span>
          </button>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              disabled={disabled}
              placeholder="Make your offer... (e.g. 'How about ₹7,500? I'll buy it right now!')"
              rows={2}
              className="w-full bg-black/40 border-4 border-[#7c7373] focus:border-[#ffad3a] focus:ring-0 text-white font-body p-4 resize-none placeholder:text-white/20"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={disabled}
            className="px-8 h-14 bg-[#ffad3a] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40"
          >
            <span className="font-bangers text-2xl text-black">SEND</span>
            <span className="material-symbols-outlined text-black">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}