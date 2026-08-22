'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Feedback } from '../lib/api'
import { api } from '../lib/api'
import { useClientOnly } from '../lib/useClientOnly'
import Link from 'next/link'

const FALLBACK_FEEDBACK: Feedback[] = [
  {
    _id: 'fallback-1',
    name: 'Alex M.',
    message: 'I feel more balanced and energized. The powder blends so smoothly in my morning smoothie.',
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'fallback-2',
    name: 'Sofia R.',
    message: 'Clean ingredients and lab testing give me total confidence. My skin looks amazing.',
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'fallback-3',
    name: 'James K.',
    message: 'Capsules are perfect for busy days—steady energy without caffeine. Big fan.',
    rating: 4,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'fallback-4',
    name: 'Priya S.',
    message: 'Switched to Royal Organics last month and the difference is noticeable. Quality product!',
    rating: 5,
    createdAt: new Date().toISOString(),
  },
]

function Stars({ value }: { value: number }) {
  const n = Math.max(1, Math.min(5, Math.round(value || 5)))
  return (
    <span className="text-amber-400 text-sm tracking-tighter" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? '' : 'text-amber-200'}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function Testimonials() {
  const isClient = useClientOnly()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(FALLBACK_FEEDBACK)
  const [loaded, setLoaded] = useState(false)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [paused, setPaused] = useState(false)
  const dragState = useRef<{ active: boolean; startX: number; offset: number; baseOffset: number }>({
    active: false,
    startX: 0,
    offset: 0,
    baseOffset: 0,
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.listFeedback()
        if (cancelled) return
        const items = (res.feedbacks || []).filter(
          (f) => f && typeof f.message === 'string' && typeof f.name === 'string' && f.message.trim().length > 0,
        )
        if (items.length > 0) {
          setFeedbacks(items)
        }
      } catch (_err) {
        // keep fallback
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const repeated = [...feedbacks, ...feedbacks]

  const computeTransform = useCallback(() => {
    if (!trackRef.current) return
    const el = trackRef.current
    if (dragState.current.active) {
      el.style.transform = `translateX(${dragState.current.baseOffset + dragState.current.offset}px)`
      el.style.animationPlayState = 'paused'
    } else if (paused) {
      el.style.animationPlayState = 'paused'
    } else {
      el.style.transform = ''
      el.style.animationPlayState = 'running'
    }
  }, [paused])

  useEffect(() => {
    computeTransform()
  }, [paused, loaded, computeTransform])

  function onPointerDown(e: React.PointerEvent) {
    if (!trackRef.current) return
    const el = trackRef.current
    const computed = window.getComputedStyle(el)
    const matrix = computed.transform
    let basePx = 0
    if (matrix && matrix !== 'none') {
      const match = matrix.match(/matrix.*\(([^)]+)\)/)
      if (match) {
        const parts = match[1].split(', ').map(Number)
        basePx = parts[4] || 0
      }
    }
    dragState.current.active = true
    dragState.current.startX = e.clientX
    dragState.current.offset = 0
    dragState.current.baseOffset = basePx
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    computeTransform()
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current.active) return
    dragState.current.offset = e.clientX - dragState.current.startX
    computeTransform()
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragState.current.active) return
    dragState.current.active = false
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    computeTransform()
  }

  return (
    <section className="section bg-royal-beige/50 overflow-hidden">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 md:mb-10">
          <div>
            <h2 className="section-title">Loved by Customers</h2>
            <p className="section-subtitle">Real stories from the Royal community</p>
          </div>
          <Link
            href="/feedback"
            className="btn-outline px-5 py-2.5 rounded-full text-sm sm:text-base self-start sm:self-auto"
          >
            Share Your Story →
          </Link>
        </div>

        <div
          className="relative"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="marquee-track-ltr flex gap-4 sm:gap-6 md:gap-8 w-max touch-pan-y select-none cursor-grab active:cursor-grabbing"
          >
            {repeated.map((t, i) => {
              const key = `${t._id}-${i}`
              const date = t.createdAt ? new Date(t.createdAt) : null
              return (
                <blockquote
                  key={key}
                  className="flex-shrink-0 w-[82%] sm:w-96 md:w-[28rem] rounded-xl bg-white border border-royal-sand p-6 shadow-soft flex flex-col"
                  style={{ minHeight: '13rem' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-emerald-600 text-lg">“</div>
                    <Stars value={t.rating ?? 5} />
                  </div>
                  <p className="text-base sm:text-lg flex-1 text-royal-text/90 leading-relaxed">
                    {t.message.length > 220 ? `${t.message.slice(0, 220)}…` : t.message}
                  </p>
                  <footer className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {t.name ? t.name.trim().charAt(0).toUpperCase() : '★'}
                      </div>
                      <div>
                        <div className="font-semibold text-royal-text text-sm sm:text-base leading-tight">
                          — {t.name}
                        </div>
                        {date && !Number.isNaN(date.getTime()) && (
                          <div className="text-[11px] sm:text-xs text-royal-muted mt-0.5">
                            {date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] sm:text-xs text-royal-muted flex-shrink-0">
                      {Number.isFinite(t.rating) ? `${(t.rating as number).toFixed(1)}/5` : '5.0/5'}
                    </div>
                  </footer>
                </blockquote>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
