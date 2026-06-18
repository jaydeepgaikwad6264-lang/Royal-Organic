'use client'
import { useState } from 'react'

const goals = ['Immunity', 'Energy', 'Digestion', 'Skin'] as const

export default function WellnessGoalSelector({
  onSelect,
}: {
  onSelect?: (goal: typeof goals[number]) => void
}) {
  const [selected, setSelected] = useState<typeof goals[number] | null>(null)

  function handleSelect(goal: typeof goals[number]) {
    setSelected(goal)
    onSelect?.(goal)
  }

  return (
    <div className="mt-6">
      <div className="text-sm text-royal-green/70">Choose your wellness goal</div>
      <div role="group" aria-label="Choose your wellness goal" className="mt-3 flex flex-wrap gap-3">
        {goals.map((g) => {
          const active = selected === g
          return (
            <button
              key={g}
              className={`px-3 py-2 rounded-full border ${active ? 'bg-royal-green text-white border-royal-green' : 'border-royal-sand hover:bg-royal-beige'}`}
              aria-pressed={active}
              onClick={() => handleSelect(g)}
            >
              {g}
            </button>
          )
        })}
      </div>
      {selected && (
        <div className="mt-3 text-sm text-royal-green/80">
          Recommended: Organic Moringa {selected === 'Skin' ? 'Powder' : 'Capsules'} for {selected.toLowerCase()}.
        </div>
      )}
    </div>
  )
}
