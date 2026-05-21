export default function VerifyRequest() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
        <div className="mb-4 text-5xl">📬</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="mb-6 text-sm text-gray-600">
          A magic link has been sent to your email address. Click the link to sign in.
        </p>
        <p className="text-xs text-gray-400">
          Didn&apos;t receive it? Check your spam folder, or{' '}
          <a href="/signin" className="text-indigo-600 hover:underline">
            try again
          </a>
          .
        </p>
      </div>
    </div>
  )
}
