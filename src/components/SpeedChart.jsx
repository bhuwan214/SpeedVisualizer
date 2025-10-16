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

// Custom plugin for progressive line drawing effect
const progressiveLinePlugin = {
  id: 'progressiveLine',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(52, 211, 153, 0.3)';
    ctx.restore();
  }
}

ChartJS.register(progressiveLinePlugin)

// Real-time line chart showing speed fluctuations during test (like Speedtest.net)
// Shows live data from speedHistory during test, or historical completed tests when idle
export default function SpeedChart({ data, speedHistory = [], testPhase = 'idle' }) {
  const { labels, dlData, ulData } = useMemo(() => {
    // If test is running and we have live data, show real-time fluctuations
    if (testPhase !== 'idle' && testPhase !== 'done' && speedHistory.length > 0) {
      // Show cleaner integer seconds for per-second data points
      const labels = speedHistory.map((pt, idx) => `${idx + 1}s`)
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
        backgroundColor: 'rgba(52,211,153,0.15)',
        tension: 0.4, // Smoother curves
        fill: true,
        pointRadius: testPhase !== 'idle' && testPhase !== 'done' ? 4 : 3,
        pointHoverRadius: 7,
        pointBackgroundColor: '#34d399',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 3, // Thicker line for better visibility
        // Add glow effect
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 10,
        shadowColor: 'rgba(52,211,153,0.5)',
      },
      {
        label: 'Upload (Mbps)',
        data: ulData,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.1)',
        tension: 0.4, // Smoother curves
        fill: true,
        pointRadius: testPhase !== 'idle' && testPhase !== 'done' ? 4 : 3,
        pointHoverRadius: 7,
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 3, // Thicker line for better visibility
        // Add glow effect
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 10,
        shadowColor: 'rgba(96,165,250,0.5)',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: testPhase !== 'idle' && testPhase !== 'done' ? 800 : 1200, // Slower animation for visible drawing
      easing: 'easeInOutQuart', // Smoother easing function
      // Progressive line drawing animation
      onProgress: function(animation) {
        // Additional visual feedback during animation
        if (animation.currentStep === 0) {
          this.tooltip.setActiveElements([], {x: 0, y: 0});
        }
      },
      // Animate new data points smoothly from left
      x: {
        type: 'number',
        easing: 'easeOutQuart',
        duration: 600,
        from: (ctx) => {
          if (ctx.type === 'data' && ctx.mode === 'default' && !ctx.dropped) {
            ctx.dropped = true
            return ctx.parsed.x - 30
          }
        }
      },
      // Animate values growing from zero
      y: {
        easing: 'easeOutCubic',
        duration: 800,
        from: (ctx) => {
          if (ctx.type === 'data' && ctx.mode === 'default') {
            return ctx.chart.scales.y.getPixelForValue(0)
          }
        }
      },
      // Slow reveal effect for the entire line
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 30; // 30ms delay between each point
        }
        return delay;
      }
    },
    plugins: {
      legend: { 
        labels: { color: '#cbd5e1', font: { size: 12 } },
        display: true,
        position: 'top',
        align: 'end'
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#cbd5e1',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + ' Mbps';
            }
            return label;
          }
        }
      },
      progressiveLine: {
        // Enable the progressive drawing effect
        enabled: true
      }
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
