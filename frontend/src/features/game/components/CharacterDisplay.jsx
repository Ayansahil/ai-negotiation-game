export default function CharacterDisplay({ character, bubble, personality, side }) {
  const isSeller = side === 'seller'

  return (
    <div className={`relative flex flex-col gap-4 ${isSeller ? 'items-start' : 'items-end'}`}>
      {/* Speech bubble */}
      {bubble && (
        <div className={`relative bg-white text-black p-6 rounded-[18px] border-4 border-black
          shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm bubble-pop
          ${isSeller ? 'speech-bubble-left translate-x-12 translate-y-4' : 'speech-bubble-right -translate-x-12 -translate-y-4 order-1 bg-[#85fff5] text-[#004d49]'}`}>
          <p className="font-bold text-lg leading-snug">"{bubble}"</p>
          {personality && (
            <div className="absolute -top-3 -right-3 bg-[#ff716a] p-1 border-4 border-black rotate-12">
              <span className="font-bangers text-white px-2 uppercase">{personality}</span>
            </div>
          )}
        </div>
      )}

      {/* Character image */}
      <div className={`relative ${isSeller ? '' : 'order-2'}`}>
        <div className={`absolute -inset-2 border-4 border-black
          ${isSeller ? 'bg-[#ffad3a] rotate-2' : 'bg-[#85fff5] -rotate-2'}`}
        />
        <img
          src={character.img}
          alt={character.name}
          className="relative w-[180px] md:w-[240px] h-[220px] md:h-[300px] object-contain border-4 border-black"
          style={{ transform: isSeller ? 'scaleX(1)' : 'scaleX(-1)' }}
        />
      </div>
    </div>
  )
}