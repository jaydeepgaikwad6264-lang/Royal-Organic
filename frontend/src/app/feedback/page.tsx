'use client'
import { useEffect, useRef, useState } from 'react'
import FormField from '../../components/FormField'
import { api } from '../../lib/api'
import Image from 'next/image'
import cap1 from '../../lib/moringa capsules/1.jpeg'
import Link from 'next/link'

export default function FeedbackPage() {
  const formSectionRef = useRef<HTMLFormElement | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(5)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
    if (isMobile && formSectionRef.current) {
      const y = formSectionRef.current.getBoundingClientRect().top + window.scrollY - 16
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    try {
      if (!name.trim() || !message.trim()) {
        throw new Error('Name and message are required')
      }
      if (!rating || rating < 1 || rating > 5) {
        throw new Error('Please select a star rating between 1 and 5')
      }
      await api.createFeedback({
        name: name.trim(),
        email: email.trim() || undefined,
        message: message.trim(),
        rating,
      })
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
      setRating(5)
    } catch (err: any) {
      setError(err.message || 'Submission failed')
      setStatus('error')
    }
  }

  return (
    <main className="min-h-[80vh] bg-gradient-to-b from-royal-beige via-emerald-50/30 to-royal-beige">
      <div className="container py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest uppercase text-royal-green bg-emerald-100/70 px-4 py-1.5 rounded-full">
              Customer Voice
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-5 tracking-tight">
              Share Your <span className="text-emerald-700">Royal Experience</span>
            </h1>
            <p className="text-royal-green/70 mt-4 text-base md:text-lg max-w-2xl mx-auto">
              Your feedback helps us craft better products and serve the Royal community. Tell us how our moringa has been part of your wellness journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-stretch">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <form
                ref={formSectionRef}
                onSubmit={onSubmit}
                className="w-full h-full rounded-2xl border border-royal-sand bg-white p-5 sm:p-8 md:p-10 shadow-[0_20px_60px_-20px_rgba(36,95,78,0.25)] grid gap-5"
                aria-label="Feedback form"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-royal-sand/60">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md">
                    <span className="text-yellow-300 text-xl">✦</span>
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl md:text-3xl">We&apos;d Love to Hear From You</h2>
                    <p className="text-sm text-royal-muted">Every message is read by the Royal team.</p>
                  </div>
                </div>

                <fieldset className="grid gap-2 rounded-xl border border-amber-200/70 bg-amber-50/50 p-4 sm:p-5">
                  <legend className="px-2 text-sm font-semibold text-royal-text">
                    Rate Your Experience
                    <span className="text-red-500 ml-1">*</span>
                  </legend>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-1 sm:gap-2" role="radiogroup" aria-label="Star rating">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const active = value <= rating
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={`${value} out of 5 stars`}
                            onClick={() => setRating(value)}
                            className="group w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all min-h-[44px] min-w-[44px] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
                          >
                            <span
                              className={`text-3xl sm:text-4xl drop-shadow-sm transition-all ${
                                active ? 'text-amber-400 scale-110 group-hover:scale-125' : 'text-amber-200 group-hover:text-amber-300'
                              }`}
                            >
                              ★
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="text-sm text-royal-muted font-medium">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Great'}
                      {rating === 5 && 'Excellent!'}
                    </div>
                  </div>
                </fieldset>

                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField
                    id="feedback-name"
                    label="Your Name"
                    value={name}
                    onChange={setName}
                    required
                    placeholder="e.g. Priya Sharma"
                  />
                  <FormField
                    id="feedback-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com (optional)"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="feedback-message" className="text-sm font-medium text-royal-text flex items-center gap-2">
                    Your Feedback
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={7}
                    placeholder="Share how Royal Organics Moringa fits into your daily routine, your favorite ways to use it, or suggestions you have for us…"
                    className="border border-royal-sand rounded-xl px-4 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-royal-green/40 focus:border-royal-green/60 resize-none text-base leading-relaxed transition"
                  />
                  <div className="flex justify-between items-center text-xs text-royal-muted">
                    <span>Tip: Specific stories help other customers decide.</span>
                    <span>{message.length}/2000</span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                    {error}
                  </div>
                )}
                {status === 'success' && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 flex items-start gap-3">
                    <span className="text-emerald-600 text-lg mt-0.5">✓</span>
                    <div>
                      <p className="font-semibold">Thank you, your feedback has been received!</p>
                      <p className="mt-1 text-emerald-700/80">
                        Your story may appear on our homepage testimonials (with just your first name + last initial, unless you ask us not to share it).
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                  <button
                    type="submit"
                    className="btn-primary px-7 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-700/20 hover:shadow-xl hover:shadow-emerald-700/30 disabled:opacity-60 disabled:cursor-not-allowed text-base min-h-[52px] transition-all"
                    disabled={status === 'loading'}
                    aria-busy={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </span>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                  <Link
                    href="/"
                    className="text-center sm:text-left text-royal-green hover:underline text-sm font-medium"
                  >
                    ← Back to home
                  </Link>
                </div>

                <div className="pt-5 mt-3 border-t border-royal-sand/60 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-emerald-50/60 p-3">
                    <div className="font-heading text-2xl text-emerald-700">100%</div>
                    <div className="text-xs text-royal-muted mt-0.5">Reviewed</div>
                  </div>
                  <div className="rounded-lg bg-amber-50/60 p-3">
                    <div className="font-heading text-2xl text-amber-600">24h</div>
                    <div className="text-xs text-royal-muted mt-0.5">Avg. Response</div>
                  </div>
                  <div className="rounded-lg bg-green-50/70 p-3">
                    <div className="font-heading text-2xl text-green-700">★★★★★</div>
                    <div className="text-xs text-royal-muted mt-0.5">Avg. Rating</div>
                  </div>
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 order-1 lg:order-2 flex flex-col gap-6">
              <div className="relative rounded-2xl border border-royal-sand bg-gradient-to-br from-white via-emerald-50/40 to-stone-50 overflow-hidden shadow-soft">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #245F4E 0, transparent 50%)' }} />
                <div className="relative p-6 md:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-royal-green bg-white border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Premium Grade
                    </span>
                    <span className="font-heading text-3xl text-amber-500/90 drop-shadow-sm">❧</span>
                  </div>

                  <div className="relative aspect-[4/3] sm:aspect-square md:aspect-[4/5] rounded-xl overflow-hidden border border-emerald-900/10 shadow-[0_12px_40px_-15px_rgba(6,78,59,0.35)] bg-gradient-to-br from-stone-50 via-white to-emerald-50">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none z-10" />
                    <Image
                      src={cap1}
                      alt="Royal Organics Moringa Capsules — Premium 500 mg 10:1 Leaf Extract"
                      fill
                      className="object-contain p-4 sm:p-6"
                      sizes="(max-width: 1024px) 80vw, 320px"
                      priority
                    />
                  </div>

                  <div className="mt-7 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div>
                        <h3 className="font-heading text-lg">10:1 Concentrated Extract</h3>
                        <p className="text-sm text-royal-green/75 mt-1">Every 500 mg veggie capsule delivers the potency of 5 grams of pure moringa leaf.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div>
                        <h3 className="font-heading text-lg">Third-Party Lab Tested</h3>
                        <p className="text-sm text-royal-green/75 mt-1">Every batch verified for purity, heavy metals &amp; microbiological safety.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div>
                        <h3 className="font-heading text-lg">Certified &amp; Licensed</h3>
                        <p className="text-sm text-royal-green/75 mt-1">Backed by Ayush, USFDA registration, IEC, and manufacturing licenses.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-royal-sand bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-6 text-white shadow-[0_20px_50px_-25px_rgba(6,78,59,0.6)]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-yellow-300 text-2xl">★★★★★</span>
                  <span className="text-yellow-200/90 text-sm font-semibold">4.9 / 5 from verified buyers</span>
                </div>
                <p className="font-heading text-2xl leading-tight">
                  Your story could be the next one featured right here.
                </p>
                <p className="text-emerald-100/80 mt-3 text-sm">
                  Drop us a quick note above — it only takes a minute and it means the world to our small team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
