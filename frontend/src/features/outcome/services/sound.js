export function playSuccessJingle() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = ctx.currentTime + i * 0.15
    gain.gain.setValueAtTime(0.3, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3)
    osc.start(start)
    osc.stop(start + 0.3)
  })
}