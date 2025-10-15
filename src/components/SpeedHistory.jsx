import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function SpeedHistory() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const raw = localStorage.getItem('speed_history')
    if (raw) setHistory(JSON.parse(raw))
  }, [])

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
      <h3 className="text-xl font-semibold mb-4 text-slate-200">Previous Tests</h3>
      {history.length === 0 && (
        <p className="text-slate-400 text-center py-8">No previous tests. Run your first test!</p>
      )}
      <div className="space-y-3">
        {history.slice(0, 8).map((h, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 p-4 rounded-xl transition-colors"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-300">
                {new Date(h.timestamp).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Test #{history.length - idx}
              </div>
            </div>
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <div className="text-xs text-slate-400">Download</div>
                <div className="text-lg font-bold text-emerald-400">{h.download.toFixed(1)}</div>
                <div className="text-xs text-slate-500">Mbps</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Upload</div>
                <div className="text-lg font-bold text-blue-400">{h.upload.toFixed(1)}</div>
                <div className="text-xs text-slate-500">Mbps</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Ping</div>
                <div className="text-lg font-medium text-yellow-400">
                  {h.ping ? h.ping : '--'}
                </div>
                <div className="text-xs text-slate-500">{h.ping ? 'ms' : ''}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
