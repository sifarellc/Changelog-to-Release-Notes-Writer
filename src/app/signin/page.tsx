'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function SignInContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const callbackUrl = searchParams.get('callbackUrl')
    if (callbackUrl) {
      router.push(callbackUrl)
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError('')
    setMessage('')

    const pendingSessionId = typeof window !== 'undefined'
      ? sessionStorage.getItem('pendingSessionId')
      : null

    const callbackUrl = pendingSessionId
      ? `/?unlock=${pendingSessionId}`
      : '/'

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl,
      })

      console.log('[SignIn] signIn result:', result)

      if (result?.error) {
        setError(`Failed to send sign-in link: ${result.error}. Please try again.`)
      } else if (result?.ok) {
        setMessage('Check your email for a magic link!')
      } else {
        // If no error but also not ok, show the URL for debugging
        setMessage('Check your email for a magic link!')
        if (result?.url) {
          console.log('[SignIn] Redirect URL:', result.url)
        }
      }
    } catch (err: any) {
      console.error('[SignIn] Error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="mb-6 text-sm text-gray-600">
          Enter your email to receive a magic link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        </form>

        {message && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to home
        </button>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Sign in</h1>
          <p className="mb-6 text-sm text-gray-600">Loading…</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
