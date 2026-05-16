'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import { ReleaseNotesForm } from '../components/ReleaseNotesForm'
import { OutputPanel } from '../components/OutputPanel'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [output, setOutput] = useState('')
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (rawNotes: string, tone: string) => {
    if (!session) {
      sessionStorage.setItem('pendingNotes', rawNotes)
      sessionStorage.setItem('pendingTone', tone)
      router.push('/api/auth/signin')
      return
    }

    setLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes, tone }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.upgrade) {
          setError('Free limit reached. Upgrade to continue.')
          return
        }
        throw new Error(data.error)
      }

      setOutput(data.releaseNotes)
      setRemaining(data.remaining)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Turn dev notes into release notes
          </h1>
          <p className="mt-2 text-gray-600">
            Paste your commits, Jira tickets, or sprint bullets. Get polished, user-facing release notes in seconds.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <ReleaseNotesForm onSubmit={handleSubmit} loading={loading} />
          <div>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}
            <OutputPanel
              content={output}
              remaining={remaining}
              onUpgrade={() => router.push('/pricing')}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
