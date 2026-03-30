import { useState, useEffect } from 'react'
import { getRandomStake } from '../services/stakes'
import { productImages } from '../../../assets/images.js'

export default function StakeDisplay({ productLabel, productImage }) {
  const [stake, setStake] = useState(null)

  useEffect(() => {
    setStake(getRandomStake())
  }, [])

  if (!stake) return null

  // Use dynamic product image if provided, else fallback to stake image
  const imgSrc = productImage && productImages[productImage] ? productImages[productImage] : stake.img
  const label = productLabel || stake.name

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-40">
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
        <img
          src={imgSrc}
          alt={label}
          className="relative w-64 md:w-96 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] rotate-12 group-hover:rotate-0 transition-all duration-700"
        />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 border-2 border-primary px-3 py-1 font-bangers text-primary tracking-widest text-lg rotate-[-2deg]">
          ITEM: {label}
        </div>
      </div>
    </div>
  )
}
