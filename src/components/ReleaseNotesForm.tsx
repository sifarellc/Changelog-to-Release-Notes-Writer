'use client'
import { useState } from 'react'

const TONES = [
  { id: 'casual', label: '😊 Casual', desc: 'Friendly & approachable' },
  { id: 'professional', label: '💼 Professional', desc: 'Clear & business-ready' },
  { id: 'technical', label: '🔧 Technical', desc: 'Precise for developers' },
]

interface Props {
  onSubmit: (rawNotes: string, tone: string) => void
  loading: boolean
}

export function ReleaseNotesForm({ onSubmit, loading }: Props) {
  const [rawNotes, setRawNotes] = useState('')
  const [tone, setTone] = useState('professional')

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Raw notes (commits, Jira tickets, sprint bullets…)
        </label>
        <textarea
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          placeholder={`Example:\n- Fixed login timeout bug (PROJ-123)\n- Added dark mode toggle\n- Upgraded database to Postgres 16\n- Refactored auth middleware`}
          className="h-48 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Brand voice</label>
        <div className="flex gap-3">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={`flex-1 rounded-lg border p-3 text-left text-sm transition ${
                tone === t.id
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{t.label}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSubmit(rawNotes, tone)}
        disabled={!rawNotes.trim() || loading}
        className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '✨ Writing…' : '✨ Generate Release Notes'}
      </button>
    </div>
  )
}
