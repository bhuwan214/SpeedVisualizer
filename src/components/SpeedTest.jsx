import React, { useState } from 'react'
import useSpeedTest from '../hooks/useSpeedTest'
import SpeedChart from './SpeedChart'
import SpeedHistory from './SpeedHistory'
import { motion } from 'framer-motion'

export default function SpeedTest() {
  const { runTest, loading, result, error } = useSpeedTest()
  const [historyVisible, setHistoryVisible] = useState(true)

  const handleStart = async () => {
    await runTest()
  }

  return (
    <div className="p-6 bg-gradient-to-r from-slate-800/60 to-slate-900/40 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Internet Speed Visualizer</h2>
        <div className="flex gap-2">
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white font-medium"
            disabled={loading}
          >
            {loading ? 'Testing...' : 'Start Test'}
          </button>
          <button
            onClick={() => setHistoryVisible((s) => !s)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-sm"
          >
            {historyVisible ? 'Hide History' : 'Show History'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 p-4 bg-slate-800/40 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Download</p>
              <h3 className="text-3xl font-bold">
                {result ? result.download.toFixed(2) : '--'} Mbps
              </h3>
            </div>
            <div>
              <p className="text-sm text-slate-300">Upload</p>
              <h3 className="text-3xl font-bold">
                {result ? result.upload.toFixed(2) : '--'} Mbps
              </h3>
            </div>
            <div>
              <p className="text-sm text-slate-300">Ping</p>
              <h3 className="text-2xl font-semibold">
                {result && result.ping ? `${result.ping} ms` : '--'}
              </h3>
            </div>
          </div>

          <div className="mt-6">
            <SpeedChart data={result} loading={loading} />
          </div>
        </motion.div>

        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-slate-800/40 rounded-xl"
        >
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-full text-center">
              <p className="text-sm text-slate-300">Last test</p>
              <p className="text-xl font-medium">
                {result ? new Date(result.timestamp).toLocaleString() : '--'}
              </p>
            </div>

            <div className="w-full flex items-center justify-center">
              <motion.div
                animate={{ x: result ? Math.min(result.download / 2, 200) : 0 }}
                transition={{ type: 'spring', stiffness: 60 }}
                className="w-40 h-4 bg-emerald-400 rounded-full"
              />
            </div>

            <div className="text-sm text-slate-400">Fun rocket visual</div>
            <div className="w-full flex items-center justify-center">
              <motion.img
                src="/rocket.svg"
                alt="rocket"
                animate={{ x: result ? Math.min(result.download, 300) : 0 }}
                transition={{ type: 'spring', stiffness: 80 }}
                className="w-16 h-16"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {historyVisible && <SpeedHistory />}

      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  )
}
