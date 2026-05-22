'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Înregistrare eșuată')
        setLoading(false)
        return
      }
    }

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email sau parolă incorectă')
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-stone-800 rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-4 h-4 border border-white rotate-[-45deg]"></div>
            </div>
            <span className="text-lg font-bold tracking-widest text-stone-800 serif">ETERNAL MEMORIES</span>
          </Link>
          <h1 className="text-3xl font-bold serif text-stone-800">
            {mode === 'signin' ? 'Bine ai revenit' : 'Creează cont'}
          </h1>
          <p className="text-stone-500 mt-2">
            {mode === 'signin' ? 'Autentifică-te pentru a-ți gestiona memorialele.' : 'Începe să păstrezi amintiri astăzi.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8">
          {/* Toggle */}
          <div className="flex rounded-2xl bg-stone-100 p-1 mb-6">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
              >
                {m === 'signin' ? 'Autentificare' : 'Înregistrare'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nume Complet</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="Numele tău"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Email</label>

              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Parolă</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                placeholder="Minimum 8 caractere"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-medium bg-red-50 rounded-xl px-4 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? 'Te rugăm să aștepți...' : mode === 'signin' ? 'Autentificare' : 'Creează Cont'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  )
}
