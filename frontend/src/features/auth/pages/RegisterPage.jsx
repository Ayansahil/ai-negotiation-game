import RegisterForm from '../components/RegisterForm'
import '../styles/auth.css'
import stack1 from '../../../assets/images/stack1.png'
import stack2 from '../../../assets/images/stack2.png'

export default function RegisterPage({ onRegister, onGoLogin }) {
  return (
    <div className="relative min-h-screen bg-background text-on-surface font-body flex flex-col overflow-x-hidden">
      <div className="fixed inset-0 halftone-bg pointer-events-none opacity-10" />

      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-background border-b-4 border-black shadow-comic">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
          <h1 className="font-headline uppercase font-black text-2xl text-primary italic tracking-tighter">
            NEGOTIATION CREW
          </h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <button onClick={onGoLogin}
            className="font-headline uppercase font-black text-sm text-stone-500 hover:bg-primary hover:text-black transition-all px-2">
            Login
          </button>
          <button
            className="font-headline uppercase font-black text-sm text-primary scale-105">
            Join the Crew
          </button>
        </nav>
      </header>

      {/* Decorative stake1 card — LEFT side */}
      <img
        src={stack1}
        alt="Stakes Left"
        className="stake-card stake-card--left"
      />

      {/* Decorative stake2 card — RIGHT side */}
      <img
        src={stack2}
        alt="Stakes Right"
        className="stake-card stake-card--right"
      />

      <main className="grow flex items-center justify-center px-4 pt-24 pb-32">
        <RegisterForm onRegister={onRegister} onGoLogin={onGoLogin} />
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-background border-t-4 border-black md:hidden">
        <button onClick={onGoLogin} className="flex flex-col items-center text-stone-400 p-2">
          <span className="material-symbols-outlined">login</span>
          <span className="font-headline font-bold uppercase text-[10px] tracking-widest">Login</span>
        </button>
        <button className="flex flex-col items-center bg-primary text-black p-2 rounded-md scale-110 border-2 border-black">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group_add</span>
          <span className="font-headline font-bold uppercase text-[10px] tracking-widest">Join</span>
        </button>
      </nav>
    </div>
  )
}