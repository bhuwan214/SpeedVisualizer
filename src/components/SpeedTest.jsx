import React, { useState } from 'react'
import useSpeedTest from '../hooks/useSpeedTest'
import SpeedChart from './SpeedChart'
import SpeedHistory from './SpeedHistory'
import SpeedGauge from './SpeedGauge'
import { motion } from 'framer-motion'

export default function SpeedTest() {
  const { runTest, loading, result, error, testPhase, currentSpeed, speedHistory } = useSpeedTest()
  const [historyVisible, setHistoryVisible] = useState(false)

  const handleStart = async () => {
    await runTest()
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          Internet Speed Test
        </h1>
        <p className="text-slate-400">Measure your connection speed with real-time visualization</p>
      </div>

      {/* Main Test Area */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Speedometer Gauge */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <SpeedGauge 
              speed={loading ? currentSpeed : (result?.download || 0)} 
              maxSpeed={150}
              phase={testPhase}
            />
            
            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              disabled={loading}
              className={`px-12 py-4 rounded-full font-semibold text-lg shadow-lg transition-all ${
                loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white'
              }`}
            >
              {loading ? 'Testing...' : 'Start Test'}
            </motion.button>

            {/* Progress indicator when testing */}
            {loading && (
              <div className="w-full max-w-md mb-4">
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ 
                      duration: testPhase === 'ping' ? 2 : 5, 
                      ease: 'linear' 
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">
                  {testPhase === 'ping' && 'Checking latency...'}
                  {testPhase === 'download' && 'Measuring download speed...'}
                  {testPhase === 'upload' && 'Measuring upload speed...'}
                </p>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <motion.div 
                className="bg-slate-800/40 rounded-xl p-4 text-center"
                animate={testPhase === 'ping' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: testPhase === 'ping' ? Infinity : 0 }}
              >
                <div className="text-xs text-slate-400 mb-1">Ping</div>
                <div className="text-xl font-bold text-yellow-400">
                  {result?.ping ? `${result.ping} ms` : '--'}
                </div>
              </motion.div>
              <motion.div 
                className="bg-slate-800/40 rounded-xl p-4 text-center"
                animate={testPhase === 'download' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: testPhase === 'download' ? Infinity : 0 }}
              >
                <div className="text-xs text-slate-400 mb-1">Download</div>
                <div className="text-xl font-bold text-emerald-400">
                  {result?.download ? `${result.download.toFixed(1)}` : '--'}
                  <span className="text-xs ml-1">Mbps</span>
                </div>
              </motion.div>
              <motion.div 
                className="bg-slate-800/40 rounded-xl p-4 text-center"
                animate={testPhase === 'upload' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: testPhase === 'upload' ? Infinity : 0 }}
              >
                <div className="text-xs text-slate-400 mb-1">Upload</div>
                <div className="text-xl font-bold text-blue-400">
                  {result?.upload ? `${result.upload.toFixed(1)}` : '--'}
                  <span className="text-xs ml-1">Mbps</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: Real-time Chart */}
          <div className="bg-slate-800/30 rounded-2xl p-6 relative overflow-hidden">
            {/* Animated background gradient when testing */}
            {(testPhase === 'download' || testPhase === 'upload') && (
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  background: testPhase === 'download' 
                    ? 'linear-gradient(45deg, #10b981, transparent)'
                    : 'linear-gradient(45deg, #3b82f6, transparent)',
                }}
                animate={{
                  x: [-100, 100],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            )}

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">
                  {testPhase !== 'idle' && testPhase !== 'done' ? 'Live Speed Fluctuation' : 'Test History'}
                </h3>
                {(testPhase === 'download' || testPhase === 'upload') && (
                  <motion.p 
                    className="text-xs text-slate-400 mt-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Measuring {testPhase} speed...
                  </motion.p>
                )}
              </div>
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-emerald-400"
                    animate={testPhase === 'download' ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  Download
                </span>
                <span className="flex items-center gap-1">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-blue-400"
                    animate={testPhase === 'upload' ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  Upload
                </span>
              </div>
            </div>
            <div className="relative z-10">
              <SpeedChart data={result} speedHistory={speedHistory} testPhase={testPhase} />
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* History Toggle */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setHistoryVisible((s) => !s)}
          className="px-6 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-full text-sm text-slate-300 transition-colors"
        >
          {historyVisible ? '▲ Hide History' : '▼ Show Previous Tests'}
        </button>
      </div>

      {historyVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <SpeedHistory />
        </motion.div>
      )}
    </div>
  )
}
