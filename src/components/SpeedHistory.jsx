import React, { useEffect, useState } from 'react'

export default function SpeedHistory() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const raw = localStorage.getItem('speed_history')
    if (raw) setHistory(JSON.parse(raw))
  }, [])

  return (
    <div className="mt-6 p-4 bg-slate-900/30 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">History</h3>
      {history.length === 0 && <p className="text-sm text-slate-400">No tests yet.</p>}
      <ul className="space-y-2">
        {history.slice(0, 6).map((h, idx) => (
          <li key={idx} className="flex items-center justify-between bg-slate-800/20 p-2 rounded">
            <div>
              <div className="text-sm text-slate-300">{new Date(h.timestamp).toLocaleString()}</div>
              <div className="text-xs text-slate-400">DL: {h.download.toFixed(2)} Mbps • UL: {h.upload.toFixed(2)} Mbps</div>
            </div>
            <div className="text-sm font-medium text-emerald-400">{h.ping ? `${h.ping} ms` : '--'}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
