import '../styles/loader.css'

export default function LoaderScreen() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0f0a0a] overflow-hidden font-body">
      
      {/* Halftone BG */}
      <div className="absolute inset-0 halftone-bg pointer-events-none" />

      {/* Top progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-[#2c2424]">
        <div className="h-full bg-[#f59e0a] transition-all duration-1000 ease-out" style={{ width: '45%' }} />
      </div>

      {/* POW text */}
      <div className="fixed top-6 left-6 opacity-20 pointer-events-none hidden md:block">
        <span className="font-headline text-7xl text-white/5 uppercase select-none">POW!</span>
      </div>

      {/* ZAP text */}
      <div className="fixed bottom-12 right-12 opacity-20 pointer-events-none hidden md:block">
        <span className="font-headline text-8xl text-white/5 uppercase rotate-12 inline-block select-none">ZAP</span>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center">
        {/* Star icon box */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-[#ffad3a33] blur-3xl rounded-full" />
          <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center bg-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2 animate-pulse-custom overflow-hidden">
            <span className="material-symbols-outlined text-[#ffad3a] text-6xl md:text-8xl select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle,#f59e0a_1px,transparent_1px)] [bg-size:6px_6px]" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h1 className="font-headline font-black text-3xl md:text-5xl uppercase italic tracking-wider text-[#f59e0a] drop-shadow-[4px_4px_0px_#000]">
            Loading Session...
          </h1>
          <div className="mt-8 flex gap-2 justify-center">
            <div className="w-3 h-3 bg-[#ffad3a] border-2 border-black animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 bg-[#ff716a] border-2 border-black animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 bg-[#76f0e7] border-2 border-black animate-bounce" />
          </div>
        </div>
      </main>
    </div>
  )
}