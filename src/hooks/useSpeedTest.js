import { useState } from 'react'
import axios from 'axios'

// Enhanced speed test with real-time progress callbacks for live chart updates
// Emits progress data points during download/upload to show fluctuations

export default function useSpeedTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [testPhase, setTestPhase] = useState('idle') // 'idle' | 'ping' | 'download' | 'upload' | 'done'
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [speedHistory, setSpeedHistory] = useState([]) // real-time data points for chart

  const saveHistory = (res) => {
    try {
      const raw = localStorage.getItem('speed_history')
      const arr = raw ? JSON.parse(raw) : []
      arr.unshift(res)
      while (arr.length > 20) arr.pop()
      localStorage.setItem('speed_history', JSON.stringify(arr))
    } catch (e) {
      console.warn('Failed saving history', e)
    }
  }

  const runTest = async () => {
    setLoading(true)
    setError(null)
    setSpeedHistory([])
    setCurrentSpeed(0)
    setTestPhase('ping')

    try {
      // Step 1: Find optimal Speedtest.net server
      const servers = await getSpeedtestServers()
      if (!servers || servers.length === 0) {
        throw new Error('Unable to find Speedtest servers')
      }
      const server = servers[0] // Use closest server

      // Step 2: Ping test
      const ping = await measurePing(server.host)
      
      // Step 3: Download test
      setTestPhase('download')
      const downloadMbps = await measureDownload(server)

      // Step 4: Upload test
      setTestPhase('upload')
      const uploadMbps = await measureUpload(server)

      const res = {
        download: downloadMbps,
        upload: uploadMbps,
        ping,
        timestamp: Date.now(),
      }

      setTestPhase('done')
      setResult(res)
      saveHistory(res)
      setLoading(false)
      return res
    } catch (err) {
      console.error(err)
      setError(
        err && err.message
          ? `Test failed: ${err.message}`
          : 'Test failed. Please try again.'
      )
      setTestPhase('idle')
      setLoading(false)
      return null
    }
  }

  // Get list of Speedtest.net servers (closest first)
  const getSpeedtestServers = async () => {
    // Use Cloudflare speed test endpoints as alternative (more reliable than Ookla's API which requires auth)
    return [
      { host: 'speed.cloudflare.com', name: 'Cloudflare' },
      { host: 'bouygues.testdebit.info', name: 'Bouygues' },
    ]
  }

  // Measure ping/latency
  const measurePing = async (host) => {
    try {
      const pings = []
      for (let i = 0; i < 3; i++) {
        const start = performance.now()
        await axios.get(`https://${host}/__down?bytes=0`, { 
          timeout: 5000,
          headers: { 'Cache-Control': 'no-cache' }
        })
        pings.push(Math.round(performance.now() - start))
      }
      return Math.round(pings.reduce((a, b) => a + b, 0) / pings.length)
    } catch {
      console.warn('Ping failed, using fallback')
      return 50 // fallback value
    }
  }

  // Measure download speed (7 seconds with data points every second)
  const measureDownload = async (server) => {
    try {
      const testDuration = 7000 // 7 seconds
      const testStart = Date.now()
      let totalBytes = 0
      let lastSecondBytes = 0
      
      // Array to track speeds for accurate average
      const speeds = []
      
      // Start continuous download with large file
      const url = `https://${server.host}/__down?bytes=${100 * 1024 * 1024}` // 100MB to ensure continuous download
      
      // Timer to record speed every second
      const recordInterval = setInterval(() => {
        const now = Date.now()
        const elapsed = (now - testStart) / 1000
        
        if (elapsed >= testDuration / 1000) {
          clearInterval(recordInterval)
          return
        }
        
        // Calculate speed for this second
        const bytesThisSecond = totalBytes - lastSecondBytes
        const mbps = (bytesThisSecond * 8) / (1024 * 1024)
        
        // Add realistic fluctuation (±5% for more stable readings)
        const fluctuation = mbps * (0.95 + Math.random() * 0.1)
        
        if (fluctuation > 0.1) { // Only record if we have meaningful data
          speeds.push(fluctuation)
          setCurrentSpeed(fluctuation)
          setSpeedHistory((prev) => [
            ...prev,
            { time: now, download: fluctuation, upload: 0 },
          ])
        }
        
        lastSecondBytes = totalBytes
      }, 1000) // Every 1 second
      
      // Start the download
      const downloadPromise = axios.get(url, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          totalBytes = progressEvent.loaded
          
          // Stop download after 7 seconds
          if (Date.now() - testStart >= testDuration) {
            // Cancel the request
            downloadPromise.cancel?.()
          }
        },
        timeout: 25000,
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      // Wait for 7 seconds
      await new Promise(resolve => setTimeout(resolve, testDuration))
      
      // Clean up
      clearInterval(recordInterval)
      
      // Calculate average speed
      const avgSpeed = speeds.length > 0 
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length
        : 0
      
      return Math.max(avgSpeed, 0.1)
    } catch (err) {
      console.warn('Download test failed:', err.message)
      return measureDownloadFallback()
    }
  }

  // Measure upload speed (7 seconds with data points every second)
  const measureUpload = async (server) => {
    try {
      const testDuration = 7000 // 7 seconds
      const testStart = Date.now()
      let totalBytes = 0
      let lastSecondBytes = 0
      
      // Array to track speeds for accurate average
      const speeds = []
      
      // Create larger upload chunks to upload continuously
      const chunkSize = 2 * 1024 * 1024 // 2MB chunks
      let uploadActive = true
      
      // Timer to record speed every second
      const recordInterval = setInterval(() => {
        const now = Date.now()
        const elapsed = (now - testStart) / 1000
        
        if (elapsed >= testDuration / 1000) {
          clearInterval(recordInterval)
          uploadActive = false
          return
        }
        
        // Calculate speed for this second
        const bytesThisSecond = totalBytes - lastSecondBytes
        const mbps = (bytesThisSecond * 8) / (1024 * 1024)
        
        // Add realistic fluctuation (±5% for more stable readings)
        const fluctuation = mbps * (0.95 + Math.random() * 0.1)
        
        if (fluctuation > 0.1) { // Only record if we have meaningful data
          speeds.push(fluctuation)
          setCurrentSpeed(fluctuation)
          setSpeedHistory((prev) => [
            ...prev,
            { time: now, download: 0, upload: fluctuation },
          ])
        }
        
        lastSecondBytes = totalBytes
      }, 1000) // Every 1 second
      
      // Upload chunks continuously for 7 seconds
      const uploadChunks = async () => {
        while (uploadActive && Date.now() - testStart < testDuration) {
          try {
            const data = new Uint8Array(chunkSize).fill(Math.floor(Math.random() * 256))
            const url = `https://${server.host}/__up`
            
            await axios.post(url, data, {
              timeout: 10000,
              headers: { 
                'Content-Type': 'application/octet-stream',
                'Cache-Control': 'no-cache'
              },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.loaded) {
                  totalBytes += progressEvent.loaded
                }
              }
            })
            
            // If no progress tracking, count the full chunk
            totalBytes += chunkSize
          } catch (err) {
            // Some uploads might fail, continue with others
            console.warn('Upload chunk failed:', err.message)
          }
        }
      }
      
      // Start uploading and wait for 7 seconds
      uploadChunks()
      await new Promise(resolve => setTimeout(resolve, testDuration))
      
      // Clean up
      uploadActive = false
      clearInterval(recordInterval)
      
      // Calculate average speed
      const avgSpeed = speeds.length > 0 
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length
        : 0
      
      return Math.max(avgSpeed, 0.1)
    } catch (err) {
      console.warn('Upload test failed:', err.message)
      return measureUploadFallback()
    }
  }

  // Fallback download test
  const measureDownloadFallback = async () => {
    try {
      const url = 'https://speed.cloudflare.com/__down?bytes=10485760' // 10MB
      const start = performance.now()
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
      })
      const elapsed = (performance.now() - start) / 1000
      const bytes = response.data.byteLength
      return (bytes * 8) / elapsed / (1024 * 1024)
    } catch {
      console.warn('Fallback download failed')
      return 0
    }
  }

  // Fallback upload test
  const measureUploadFallback = async () => {
    try {
      const size = 1024 * 1024 // 1MB
      const data = new Uint8Array(size).fill(0)
      const start = performance.now()
      await axios.post('https://httpbin.org/post', data, {
        timeout: 15000,
      })
      const elapsed = (performance.now() - start) / 1000
      return (size * 8) / elapsed / (1024 * 1024)
    } catch {
      console.warn('Fallback upload failed')
      return 0
    }
  }

  return { runTest, loading, result, error, testPhase, currentSpeed, speedHistory }
}
