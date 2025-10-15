import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function SpeedChart({ data, loading }) {
  const chartData = {
    labels: ['Download', 'Upload'],
    datasets: [
      {
        label: 'Mbps',
        data: data ? [data.download, data.upload] : [0, 0],
        backgroundColor: ['#34d399', '#60a5fa'],
      },
    ],
  }

  const options = {
    responsive: true,
    animation: {
      duration: 800,
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#e5e7eb' },
      },
      x: {
        ticks: { color: '#e5e7eb' },
      },
    },
  }

  return (
    <div className="w-full">
      <Bar data={chartData} options={options} />
    </div>
  )
}
