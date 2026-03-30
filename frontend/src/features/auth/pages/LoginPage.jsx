import LoginForm from '../components/LoginForm'
import '../styles/auth.css'
import stack3 from '../../../assets/images/stack3.png'

export default function LoginPage({ onLogin, onGoRegister }) {
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
          <button onClick={onLogin}
            className="font-headline uppercase font-black text-sm text-primary scale-105">
            Login
          </button>
          <button onClick={onGoRegister}
            className="font-headline uppercase font-black text-sm text-stone-500 hover:bg-primary hover:text-black transition-all px-2">
            Join the Crew
          </button>
        </nav>
      </header>

      {/* Decorative stake3 card — LEFT side */}
      <img
        src={stack3}
        alt="The Stakes"
        className="stake-card stake-card--left"
      />

      <main className="grow flex items-center justify-center p-6 pt-24 pb-32">
        <LoginForm onLogin={onLogin} onGoRegister={onGoRegister} />
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-background border-t-4 border-black md:hidden">
        <button className="flex flex-col items-center bg-primary text-black p-2 rounded-md scale-110 border-2 border-black">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
          <span className="font-headline font-bold uppercase text-[10px] tracking-widest">Login</span>
        </button>
        <button onClick={onGoRegister} className="flex flex-col items-center text-stone-400 p-2">
          <span className="material-symbols-outlined">group_add</span>
          <span className="font-headline font-bold uppercase text-[10px] tracking-widest">Join</span>
        </button>
      </nav>
    </div>
  )
}