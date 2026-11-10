'use client'

import Image, { type StaticImageData } from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaSearchPlus, FaSearchMinus, FaUndo, FaTimes } from 'react-icons/fa'

type Certificate = { src: StaticImageData; alt: string }

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const STEP = 0.5
// Certificates open pre-zoomed so the fine print is readable without any tap.
const AUTO_ZOOM = 2

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const controlClass =
  'flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10'

export default function CertificateGallery({ certificates }: { certificates: Certificate[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null)
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null)

  const isOpen = openIndex !== null
  const active = openIndex === null ? null : certificates[openIndex]

  const bounds = useCallback((value: number) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (rect.width * (value - 1)) / 2, y: (rect.height * (value - 1)) / 2 }
  }, [])

  const applyZoom = useCallback(
    (next: number) => {
      const value = clamp(next, MIN_ZOOM, MAX_ZOOM)
      setZoom(value)
      setOffset((prev) => {
        const max = bounds(value)
        return { x: clamp(prev.x, -max.x, max.x), y: clamp(prev.y, -max.y, max.y) }
      })
    },
    [bounds],
  )

  const close = useCallback(() => {
    setOpenIndex(null)
    setZoom(MIN_ZOOM)
    setOffset({ x: 0, y: 0 })
  }, [])

  // Automatic zoom-in animation every time a certificate is opened.
  useEffect(() => {
    if (!isOpen) return
    setZoom(MIN_ZOOM)
    setOffset({ x: 0, y: 0 })
    const timer = window.setTimeout(() => setZoom(AUTO_ZOOM), 90)
    return () => window.clearTimeout(timer)
  }, [isOpen, openIndex])

  // Keyboard controls + page-scroll lock while the viewer is open.
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === '+' || event.key === '=') applyZoom(zoom + STEP)
      if (event.key === '-') applyZoom(zoom - STEP)
      if (event.key === '0') {
        setZoom(MIN_ZOOM)
        setOffset({ x: 0, y: 0 })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, zoom, close, applyZoom])

  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  // Mouse-wheel zoom (registered natively so the event can be cancelled).
  useEffect(() => {
    const stage = stageRef.current
    if (!isOpen || !stage) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      applyZoom(zoom - event.deltaY * 0.002)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [isOpen, zoom, applyZoom])

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointersRef.current.size === 1) {
      panRef.current = { startX: event.clientX, startY: event.clientY, x: offset.x, y: offset.y }
      setIsPanning(true)
    } else if (pointersRef.current.size === 2) {
      const [a, b] = Array.from(pointersRef.current.values())
      pinchRef.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom }
      panRef.current = null
      setIsPanning(false)
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [a, b] = Array.from(pointersRef.current.values())
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      applyZoom(pinchRef.current.zoom * (distance / pinchRef.current.distance))
      return
    }

    const pan = panRef.current
    if (!pan) return
    const max = bounds(zoom)
    setOffset({
      x: clamp(pan.x + (event.clientX - pan.startX), -max.x, max.x),
      y: clamp(pan.y + (event.clientY - pan.startY), -max.y, max.y),
    })
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId)

    if (pointersRef.current.size < 2) pinchRef.current = null
    if (pointersRef.current.size === 0) {
      panRef.current = null
      setIsPanning(false)
      return
    }
    const [remaining] = Array.from(pointersRef.current.values())
    panRef.current = { startX: remaining.x, startY: remaining.y, x: offset.x, y: offset.y }
  }

  function handleDoubleClick() {
    if (zoom > MIN_ZOOM + 0.05) {
      setZoom(MIN_ZOOM)
      setOffset({ x: 0, y: 0 })
      return
    }
    applyZoom(AUTO_ZOOM)
  }

  const zoomPercent = Math.round(zoom * 100)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {certificates.map((cert, index) => (
          <button
            key={cert.alt}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Zoom ${cert.alt}`}
            className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-stone-50 via-white to-amber-50/70 p-2.5 text-left shadow-[0_10px_30px_-12px_rgba(6,78,59,0.25)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:p-3"
          >
            <span className="pointer-events-none absolute inset-2 rounded-xl ring-1 ring-inset ring-emerald-900/10" />
            <span className="relative block h-full w-full overflow-hidden rounded-lg bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]">
              <Image
                src={cert.src}
                alt={cert.alt}
                fill
                className="object-contain p-1.5 sm:p-2"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </span>
            <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-emerald-900/85 px-2 py-1 text-[10px] font-semibold text-white transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
              <FaSearchPlus className="h-2.5 w-2.5" />
              Zoom
            </span>
          </button>
        ))}
      </div>

      {isOpen && active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          className="fixed inset-0 z-[110] flex flex-col bg-black/90 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-white sm:px-5 sm:py-3">
            <p className="min-w-0 truncate text-sm font-medium sm:text-base">{active.alt}</p>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => applyZoom(zoom - STEP)}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Zoom out"
                className={controlClass}
              >
                <FaSearchMinus className="h-3.5 w-3.5" />
              </button>
              <span className="w-12 text-center text-xs font-semibold tabular-nums text-white/80 sm:text-sm">
                {zoomPercent}%
              </span>
              <button
                type="button"
                onClick={() => applyZoom(zoom + STEP)}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Zoom in"
                className={controlClass}
              >
                <FaSearchPlus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(MIN_ZOOM)
                  setOffset({ x: 0, y: 0 })
                }}
                aria-label="Reset zoom"
                className={controlClass}
              >
                <FaUndo className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={close} aria-label="Close viewer" className={controlClass}>
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            className="relative flex-1 touch-none select-none overflow-hidden"
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          >
            <div
              className="absolute inset-0 p-2 sm:p-6"
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                transition: isPanning ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform',
              }}
            >
              <Image
                src={active.src}
                alt={active.alt}
                fill
                unoptimized
                draggable={false}
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>

          <p className="px-4 py-2.5 text-center text-[11px] text-white/55 sm:text-xs">
            Pinch or scroll to zoom · drag to move · double-tap to reset · Esc to close
          </p>
        </div>
      )}
    </>
  )
}
