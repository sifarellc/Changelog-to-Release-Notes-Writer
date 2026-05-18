'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyRequestContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <div className="mb-4 text-5xl">📬</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="mb-6 text-sm text-gray-600">
          {email
            ? `We sent a sign-in link to ${email}. Click the link to continue.`
            : 'We sent you a sign-in link. Check your email and click the link to continue.'}
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default function VerifyRequest() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-5xl">📬</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mb-6 text-sm text-gray-600">Loading…</p>
        </div>
      </div>
    }>
      <VerifyRequestContent />
    </Suspense>
  )
}
