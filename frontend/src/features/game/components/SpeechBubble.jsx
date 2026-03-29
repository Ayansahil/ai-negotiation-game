export default function SpeechBubble({ text, side, personality }) {
  const isSeller = side === 'seller'

  return (
    <div className={`relative p-6 rounded-[18px] border-4 border-black
      shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm bubble-pop
      ${isSeller
        ? 'bg-white text-black speech-bubble-left translate-x-12 translate-y-4'
        : 'bg-[#85fff5] text-[#004d49] speech-bubble-right -translate-x-12 -translate-y-4'
      }`}>
      <p className="font-bold text-lg leading-snug">"{text}"</p>
      {personality && (
        <div className="absolute -top-3 -right-3 bg-[#ff716a] p-1 border-4 border-black rotate-12">
          <span className="font-bangers text-white px-2 uppercase tracking-widest">
            {personality}
          </span>
        </div>
      )}
    </div>
  )
}
