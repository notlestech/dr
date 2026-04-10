'use client'

import { useRef, useState } from 'react'


interface Entry {
  id: string
  displayName: string
}

interface SlotMachineProps {
  entries: Entry[]
  onWinnerSelected: (entry: Entry) => void
}

export function SlotMachine({ entries, onWinnerSelected }: SlotMachineProps) {
  const reelRef = useRef<HTMLDivElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [displayedName, setDisplayedName] = useState('???')

  function fisherYates<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  async function spin() {
    if (isSpinning || entries.length === 0) return
    setIsSpinning(true)

    const reel = reelRef.current
    if (!reel) return

    // Pick winner
    const shuffled = fisherYates(entries)
    const winner = shuffled[0]

    // Build a long list of random names for the reel scroll
    const displayList = [...fisherYates(entries), ...fisherYates(entries), ...fisherYates(entries), winner]
    const ITEM_HEIGHT = 56

    // Reset reel content
    reel.innerHTML = displayList
      .map(e => `<div class="flex items-center justify-center h-14 text-lg font-semibold text-zinc-200 px-4 truncate">${e.displayName}</div>`)
      .join('')

    const totalHeight = displayList.length * ITEM_HEIGHT
    const targetY = -(totalHeight - ITEM_HEIGHT)

    // Fast scroll → slow → stop
    await reel.animate(
      [{ transform: 'translateY(0px)' }, { transform: `translateY(${targetY}px)` }],
      { duration: 4000, easing: 'cubic-bezier(0.25, 0.1, 0.1, 1.0)', fill: 'forwards' }
    ).finished

    setDisplayedName(winner.displayName)
    setIsSpinning(false)
    onWinnerSelected(winner)
  }

  return { spin, isSpinning, reelRef, displayedName }
}
