export default function CharacterCard({ character, selected, onSelect, mirror = false }) {
  return (
    <div
      onClick={() => onSelect(character)}
      className={`character-card rounded-lg p-3 flex flex-col items-center cursor-pointer
        ${selected ? 'selected' : ''}`}
    >
      <img
        src={character.img}
        alt={character.name}
        className="character-image bg-[#1f1818] rounded-md border-2 border-black"
        style={{ transform: mirror ? 'scaleX(-1)' : 'scaleX(1)' }}
      />
      <p className={`font-bangers text-2xl text-center mt-3 tracking-wide
        ${selected ? 'text-[#f59e0b]' : 'text-white'}`}>
        {character.name}
      </p>
    </div>
  )
}