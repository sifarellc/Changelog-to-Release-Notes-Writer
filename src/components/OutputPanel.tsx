'use client'
import { useState } from 'react'

interface Props {
  content: string
  remaining: number | null
  onUpgrade: () => void
}

export function OutputPanel({ content, remaining, onUpgrade }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `release-notes-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!content) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Release notes</h3>
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
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">{content}</pre>
      </div>

      {remaining !== null && (
        <div className={`rounded-lg p-3 text-sm ${remaining <= 1 ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
          {remaining > 0 ? (
            <>{remaining} free {remaining === 1 ? 'use' : 'uses'} remaining this month.</>
          ) : (
            <>Free limit reached.{' '}
              <button onClick={onUpgrade} className="font-medium underline">
                Upgrade to Pro →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
