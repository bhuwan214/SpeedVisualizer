import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Real-time line chart showing speed fluctuations during test (like Speedtest.net)
// Shows live data from speedHistory during test, or historical completed tests when idle
export default function SpeedChart({ data, speedHistory = [], testPhase = 'idle' }) {
  const { labels, dlData, ulData } = useMemo(() => {
    // If test is running and we have live data, show real-time fluctuations
    if (testPhase !== 'idle' && testPhase !== 'done' && speedHistory.length > 0) {
      const startTime = speedHistory[0]?.time || Date.now()
      const labels = speedHistory.map((pt) => `${((pt.time - startTime) / 1000).toFixed(1)}s`)
      const dlData = speedHistory.map((pt) => Number((pt.download || 0).toFixed(2)))
      const ulData = speedHistory.map((pt) => Number((pt.upload || 0).toFixed(2)))
      return { labels, dlData, ulData }
    }

    // Otherwise show completed test history from localStorage
    const raw = localStorage.getItem('speed_history')
    let history = raw ? JSON.parse(raw) : []
    history = history.slice(0, 10).reverse()

    if (data && testPhase === 'done') {
      history.push({
        timestamp: data.timestamp || Date.now(),
        download: data.download || 0,
        upload: data.upload || 0,
      })
    }

    const labels = history.map((h, i) => `Test ${i + 1}`)
    const dlData = history.map((h) => Number((h.download || 0).toFixed(2)))
    const ulData = history.map((h) => Number((h.upload || 0).toFixed(2)))

    return { labels, dlData, ulData }
  }, [data, speedHistory, testPhase])

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Download (Mbps)',
        data: dlData,
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.12)',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Upload (Mbps)',
        data: ulData,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.08)',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 400, // Faster animation for real-time feel
      easing: 'easeInOutCubic',
      // Animate new data points smoothly
      x: {
        type: 'number',
        easing: 'linear',
        duration: 300,
        from: (ctx) => {
          if (ctx.type === 'data' && ctx.mode === 'default' && !ctx.dropped) {
            ctx.dropped = true
            return ctx.parsed.x - 20
          }
        }
      },
      y: {
        easing: 'easeInOutCubic',
        duration: 400,
        from: (ctx) => {
          if (ctx.type === 'data' && ctx.mode === 'default') {
            return ctx.chart.scales.y.getPixelForValue(0)
          }
        }
      }
    },
    plugins: {
      legend: { 
        labels: { color: '#cbd5e1', font: { size: 12 } },
        display: true
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#cbd5e1',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { 
          color: '#94a3b8',
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { 
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value) => `${value.toFixed(0)} Mbps`
        },
        grid: { color: 'rgba(148,163,184,0.08)' },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  }

  return (
    <div className="w-full h-56 md:h-72">
      <Line data={chartData} options={options} />
    </div>
  )
}
