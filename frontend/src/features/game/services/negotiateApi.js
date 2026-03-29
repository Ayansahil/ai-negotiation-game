const MIN_PRICE = 6800

export async function sendNegotiationOffer({ userMessage, currentPrice, round, personality }) {
  // Backend ready ho toh yeh uncomment karo:
  // const res = await fetch('http://localhost:5000/api/negotiate/offer', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userMessage, currentPrice, round, personality })
  // })
  // return res.json()

  // Abhi ke liye in-memory logic:
  return localNegotiateLogic({ userMessage, currentPrice, personality })
}

function localNegotiateLogic({ userMessage, currentPrice, personality }) {
  const lower = userMessage.toLowerCase()
  const offerMatch = userMessage.match(/[\d,]+/)
  const offeredPrice = offerMatch ? parseInt(offerMatch[0].replace(/,/g, '')) : null

  if (offeredPrice && offeredPrice <= MIN_PRICE) {
    return { newPrice: offeredPrice, mood: 'positive', isDeal: true, sellerMessage: `Deal! ₹${offeredPrice.toLocaleString()} — you earned it. 🤝` }
  }

  const hasFlattery = /love|amazing|best|quality|worth|respect|fair|trust/.test(lower)
  const hasReason = /student|budget|broke|salary|cheaper|elsewhere|competitor/.test(lower)
  const hasAggression = /ridiculous|scam|overpriced|never|worst/.test(lower)

  let drop = 0, mood = 'neutral'

  if (personality === 'emotional') {
    if (hasFlattery) { drop = 400; mood = 'positive' }
    else if (hasAggression) { drop = 0; mood = 'angry' }
    else { drop = 100; mood = 'neutral' }
  } else if (personality === 'logical') {
    if (hasReason) { drop = 350; mood = 'neutral' }
    else { drop = 50 }
  } else {
    drop = hasReason ? 150 : hasFlattery ? 100 : 50
    if (hasAggression) { drop = 0; mood = 'annoyed' }
  }

  const newPrice = Math.max(MIN_PRICE + 1, currentPrice - drop)
  const sellerMessage = drop > 0
    ? `Hmm... I can go to ₹${newPrice.toLocaleString()}. That's my offer.`
    : `I'm not moving on this price. ₹${currentPrice.toLocaleString()} is fair.`

  return { newPrice, mood, isDeal: false, sellerMessage }
}