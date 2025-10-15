import React from 'react'
import { motion } from 'framer-motion'

// Circular speedometer gauge similar to Speedtest.net with enhanced animations
export default function SpeedGauge({ speed, maxSpeed = 150, label = 'Mbps', phase = 'idle' }) {
  const percentage = Math.min((speed / maxSpeed) * 100, 100)
  const circumference = 2 * Math.PI * 90 // radius = 90
  const offset = circumference - (percentage / 100) * circumference

  const phaseColors = {
    idle: '#475569',
    ping: '#fbbf24',
    download: '#10b981',
    upload: '#3b82f6',
    done: '#8b5cf6',
  }

  const phaseGlow = {
    idle: 'rgba(71, 85, 105, 0.3)',
    ping: 'rgba(251, 191, 36, 0.4)',
    download: 'rgba(16, 185, 129, 0.5)',
    upload: 'rgba(59, 130, 246, 0.5)',
    done: 'rgba(139, 92, 246, 0.4)',
  }

  const color = phaseColors[phase] || phaseColors.idle
  const glow = phaseGlow[phase] || phaseGlow.idle
  const isActive = phase !== 'idle' && phase !== 'done'

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing glow effect when active */}
      {isActive && (
        <motion.div
          className="absolute w-64 h-64 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <svg width="240" height="240" className="transform -rotate-90 relative z-10">
        {/* Background circle */}
        <circle
          cx="120"
          cy="120"
          r="90"
          fill="none"
          stroke="#1e293b"
          strokeWidth="16"
        />
        
        {/* Gradient glow ring */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Progress circle with animated transition */}
        <motion.circle
          cx="120"
          cy="120"
          r="90"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: offset,
            stroke: color
          }}
          transition={{ 
            strokeDashoffset: { duration: 0.5, ease: 'easeOut' },
            stroke: { duration: 0.3 }
          }}
        />
      </svg>

      {/* Center text with enhanced animation */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.div
          key={Math.floor(speed * 10)} // Update animation more frequently
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="text-5xl font-bold"
          style={{ color, textShadow: `0 0 20px ${glow}` }}
        >
          {speed.toFixed(1)}
        </motion.div>
        <motion.div 
          className="text-sm text-slate-400 mt-1"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {label}
        </motion.div>
        <motion.div 
          className="text-xs font-medium mt-1 capitalize px-3 py-1 rounded-full"
          style={{ 
            backgroundColor: `${color}20`,
            color: color,
            border: `1px solid ${color}40`
          }}
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {phase === 'idle' ? 'Ready' : phase === 'done' ? 'Complete' : `Testing ${phase}...`}
        </motion.div>
      </div>
    </div>
  )
}
