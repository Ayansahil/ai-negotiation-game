import CharacterGrid from '../components/CharacterGrid'
import ComicBackground from '../components/ComicBackground'
import '../styles/characterSelect.css'

export default function CharacterSelectPage({ onStart }) {
  return (
    <div className="relative min-h-screen bg-background text-on-background font-body overflow-x-hidden">
      <ComicBackground />
      <CharacterGrid onStart={onStart} />
    </div>
  )
}