import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Circular speedometer gauge similar to Speedtest.net with enhanced animations
export default function SpeedGauge({ speed, maxSpeed = 150, label = 'Mbps', phase = 'idle' }) {
  const percentage = Math.min((speed / maxSpeed) * 100, 100)
  const circumference = 2 * Math.PI * 90 // radius = 90
  const offset = circumference - (percentage / 100) * circumference
  
  // Track speed changes for ripple effects
  const [showRipple, setShowRipple] = useState(false)
  const [prevSpeed, setPrevSpeed] = useState(speed)

  useEffect(() => {
    // Trigger ripple on significant speed change (>5 Mbps)
    if (Math.abs(speed - prevSpeed) > 5 && speed > 0) {
      setShowRipple(true)
      setTimeout(() => setShowRipple(false), 1000)
    }
    setPrevSpeed(speed)
  }, [speed, prevSpeed])

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

      {/* Animated rotating rings when active */}
      {isActive && (
        <>
          <motion.div
            className="absolute w-60 h-60 rounded-full border-2 opacity-20"
            style={{ borderColor: color }}
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full border opacity-10"
            style={{ borderColor: color }}
            animate={{
              rotate: -360,
              scale: [1, 1.08, 1],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        </>
      )}

      {/* Ripple effect on speed change */}
      <AnimatePresence>
        {showRipple && (
          <>
            <motion.div
              className="absolute w-60 h-60 rounded-full border-2"
              style={{ borderColor: color }}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <motion.div
              className="absolute w-60 h-60 rounded-full border-2"
              style={{ borderColor: color }}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            />
            <motion.div
              className="absolute w-60 h-60 rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
              }}
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </>
        )}
      </AnimatePresence>

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
        
        {/* Animated background circle outline */}
        <motion.circle
          cx="120"
          cy="120"
          r="90"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
          strokeDasharray="5,5"
          animate={{
            strokeDashoffset: [0, -10],
            opacity: isActive ? [0.2, 0.4, 0.2] : 0.3,
          }}
          transition={{
            strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" },
            opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          }}
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
          
          {/* Gradient for progress circle */}
          <linearGradient id={`gradient-${phase}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Outer decorative circles (animated based on speed) */}
        {speed > 5 && (
          <>
            <motion.circle
              cx="120"
              cy="30"
              r="4"
              fill={color}
              opacity="0.6"
              animate={{
                r: [3, 5, 3],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="210"
              cy="120"
              r="4"
              fill={color}
              opacity="0.6"
              animate={{
                r: [3, 5, 3],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1,
                delay: 0.25,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="120"
              cy="210"
              r="4"
              fill={color}
              opacity="0.6"
              animate={{
                r: [3, 5, 3],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1,
                delay: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="30"
              cy="120"
              r="4"
              fill={color}
              opacity="0.6"
              animate={{
                r: [3, 5, 3],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1,
                delay: 0.75,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        )}

        {/* Progress circle with animated transition */}
        <motion.circle
          cx="120"
          cy="120"
          r="90"
          fill="none"
          stroke={`url(#gradient-${phase})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: offset,
          }}
          transition={{ 
            strokeDashoffset: { duration: 0.5, ease: 'easeOut' },
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
        
        {/* Speed indicator bars */}
        {speed > 5 && (
          <div className="flex gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`bar-${i}`}
                className="w-1 rounded-full"
                style={{ 
                  backgroundColor: i < Math.floor((speed / maxSpeed) * 5) ? color : '#334155',
                  height: `${8 + i * 2}px`,
                }}
                initial={{ scaleY: 0 }}
                animate={{ 
                  scaleY: i < Math.floor((speed / maxSpeed) * 5) ? 1 : 0.3,
                  opacity: i < Math.floor((speed / maxSpeed) * 5) ? 1 : 0.3,
                }}
                transition={{ 
                  duration: 0.3,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
