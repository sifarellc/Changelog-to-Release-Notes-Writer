'use client'
import { useSession } from 'next-auth/react'
import { Header } from '../../components/Header'

export default function PricingPage() {
  const { data: session } = useSession()

  const handleUpgrade = async () => {
    const res = await fetch('/api/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-8 text-center text-3xl font-bold">Simple pricing</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Free tier */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Free</h2>
            <p className="mt-1 text-3xl font-bold">$0<span className="text-base font-normal text-gray-500">/mo</span></p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>✓ 3 rewrites per month</li>
              <li>✓ All 3 brand voices</li>
              <li>✓ Export as Markdown</li>
            </ul>
            <div className="mt-6 rounded-lg bg-gray-100 px-4 py-2 text-center text-sm text-gray-500">
              {session ? 'Your current plan' : 'Get started free'}
            </div>
          </div>

          {/* Pro tier */}
          <div className="rounded-xl border-2 border-indigo-500 bg-white p-6">
            <h2 className="text-lg font-semibold">Pro</h2>
            <p className="mt-1 text-3xl font-bold">$19<span className="text-base font-normal text-gray-500">/mo</span></p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>✓ Unlimited rewrites</li>
              <li>✓ All 3 brand voices</li>
              <li>✓ Export as Markdown</li>
              <li>✓ Priority processing</li>
            </ul>
            <button
              onClick={handleUpgrade}
              className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
