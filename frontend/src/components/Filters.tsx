'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Filters() {
  const router = useRouter()
  const params = useSearchParams()

  function updateFilter(key: string, value: boolean) {
    const url = new URL(window.location.href)
    const next = new URLSearchParams(url.search)
    if (value) next.set('filter', key)
    else next.delete('filter')
    router.push(`/shop?${next.toString()}`)
  }

  const current = params.get('filter')
  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Filter products">
      {[
        { key: 'powder', label: 'Powder' },
        { key: 'capsules', label: 'Capsules' },
      ].map(({ key, label }) => {
        const active = current === key
        return (
          <button
            key={key}
            className={`px-3 py-2 rounded-full border ${active ? 'bg-royal-green text-white border-royal-green' : 'border-royal-sand hover:bg-royal-beige'}`}
            aria-pressed={active}
            onClick={() => updateFilter(key, !active)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
