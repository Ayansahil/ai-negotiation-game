const INITIAL_PRICE = 9999

export default function ResultBanner({ won, finalPrice, buyer, seller }) {
  const savings = INITIAL_PRICE - finalPrice
  const pct = Math.round((savings / INITIAL_PRICE) * 100)

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Characters */}
      <div className="flex items-end gap-16">
        <img src={seller.img} alt={seller.name}
          className={`w-35] h-45 object-contain border-4 border-black
            ${won ? '' : 'scale-110'}`}
          style={{ transform: won ? 'scaleX(1)' : 'scaleX(1)' }}
        />
        <img src={buyer.img} alt={buyer.name}
          className={`w-35 h-45 object-contain border-4 border-black
            ${won ? 'animate-celebrate' : 'opacity-60 translate-y-4'}`}
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      {/* Banner */}
      <div className={`p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        ${won ? 'bg-[#f59e0a]' : 'bg-[#a80619]'}`}>
        <h1 className="font-headline text-6xl font-black uppercase italic text-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
          {won ? 'DEAL SECURED!' : 'NEGOTIATION FAILED'}
        </h1>
        {won && (
          <div className="mt-4 flex gap-6 justify-center">
            <div className="bg-black text-[#ffad3a] px-6 py-3 border-4 border-black">
              <p className="font-bangers text-sm tracking-widest">FINAL PRICE</p>
              <p className="font-bangers text-4xl">₹{finalPrice.toLocaleString()}</p>
            </div>
            <div className="bg-white text-black px-6 py-3 border-4 border-black">
              <p className="font-bangers text-sm tracking-widest">YOU SAVED</p>
              <p className="font-bangers text-4xl text-green-600">₹{savings.toLocaleString()}</p>
            </div>
            <div className="bg-[#4ecdc4] text-black px-6 py-3 border-4 border-black">
              <p className="font-bangers text-sm tracking-widest">DISCOUNT</p>
              <p className="font-bangers text-4xl">{pct}% OFF</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}