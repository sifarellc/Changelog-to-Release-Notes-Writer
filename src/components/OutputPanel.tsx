'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  content: string
  remaining: number | null
  isPreview?: boolean
  sessionId?: string | null
}

export function OutputPanel({ content, remaining, isPreview, sessionId }: Props) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleCopy = async () => {
    if (isPreview) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    if (isPreview) return
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `release-notes-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUnlock = () => {
    // Store the session ID so the sign-in flow can retrieve the notes after auth
    if (sessionId) {
      sessionStorage.setItem('pendingSessionId', sessionId)
    }
    router.push('/signin')
  }

  if (!content) return null

  // For preview mode, show only the first ~40% of lines
  const lines = content.split('\n')
  const previewLineCount = Math.max(3, Math.ceil(lines.length * 0.4))
  const previewLines = lines.slice(0, previewLineCount)
  const previewContent = previewLines.join('\n')
  const hasMore = lines.length > previewLineCount

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          {isPreview ? 'Preview' : 'Release notes'}
        </h3>
        {!isPreview && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button
              onClick={handleExport}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              📥 Export .md
            </button>
          </div>
        )}
      </div>

      <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
          {isPreview ? previewContent : content}
        </pre>

        {isPreview && hasMore && (
          <>
            {/* Gradient blur overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 rounded-b-lg bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent pointer-events-none" />

            {/* CTA overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
              <div className="rounded-xl bg-white/95 shadow-lg border border-gray-200 px-6 py-4 text-center backdrop-blur-sm max-w-xs mx-4">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  🔒 {lines.length - previewLineCount} more lines
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Sign in free to see the full result, copy it, and export as Markdown.
                </p>
                <button
                  onClick={handleUnlock}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                >
                  Sign in to unlock →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isPreview && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          👆 This is a preview. Create a free account to see the full output, copy, and export.
        </div>
      )}

      {remaining !== null && !isPreview && (
        <div className={`rounded-lg p-3 text-sm ${remaining <= 1 ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
          {remaining > 0 ? (
            <>{remaining} free {remaining === 1 ? 'use' : 'uses'} remaining this month.</>
          ) : (
            <>Free limit reached.{' '}
              <button onClick={() => router.push('/pricing')} className="font-medium underline">
                Upgrade to Pro →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
