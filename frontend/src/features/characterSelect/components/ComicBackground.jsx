export default function ComicBackground() {
  return (
    <>
      {/* Comic panel grid */}
      <div className="comic-panel-grid opacity-40">
        <div className="panel-1 halftone text-black/10" />
        <div className="panel-2 halftone text-black/10" />
        <div className="panel-3 halftone text-black/10" />
        <div className="panel-4 halftone text-black/10" />
        <div className="panel-5 halftone text-black/10" />
      </div>

      {/* Sound effect words */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex flex-wrap items-center justify-around p-20 select-none">
        <span className="font-headline text-9xl text-black opacity-[0.08] -rotate-12 uppercase">POW!</span>
        <span className="font-headline text-[12rem] text-black opacity-[0.08] rotate-6 uppercase">DEAL!</span>
        <span className="font-headline text-8xl text-black opacity-[0.08] -rotate-3 uppercase">BAZAAR!</span>
      </div>
    </>
  )
}