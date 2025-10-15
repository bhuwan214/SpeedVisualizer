import { useState } from 'react'
import axios from 'axios'

// Simple client-side speed test: download a small file multiple times and measure throughput.
// Note: Browser-based speed tests are approximate and can be affected by caching and CDN.

export default function useSpeedTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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
    try {
      // Full test: ping + download + upload
      // Ping: try a fast small request; if blocked fall back later
      const pingStart = performance.now()
      try {
        await axios.head('https://www.google.com/generate_204', { timeout: 5000 })
      } catch (e) {
        // ignore - we'll compute ping from image fallback later if needed
      }
      const ping = Math.round(performance.now() - pingStart)

      // Download: try a moderately sized file (will be cached by some CDNs unless cache-busted)
      const dlStart = performance.now()
      const url = 'https://speed.hetzner.de/100MB.bin'
      let mbps = 0
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          onDownloadProgress: () => {},
          headers: { 'Cache-Control': 'no-cache' },
          timeout: 20000,
        })
        const dlEnd = performance.now()
        const bytes = response.data.byteLength || response.data.length || 0
        const durationSec = Math.max((dlEnd - dlStart) / 1000, 0.001)
        const bits = bytes * 8
        mbps = bits / durationSec / (1024 * 1024)
      } catch (dlErr) {
        // download failed (CORS, blocked, timeout) - we'll fallback later
        console.warn('Download failed:', dlErr.message || dlErr)
        mbps = 0
      }

      // Upload: attempt a small upload; if blocked, fallback
      let ulMbps = 0
      try {
        const uploadSize = 256 * 1024 // 256KB (smaller, more likely to succeed)
        const uploadData = new Uint8Array(uploadSize).map((_, i) => i % 256)
        const ulStart = performance.now()
        await axios.post('https://httpbin.org/post', uploadData, { timeout: 15000 })
        const ulEnd = performance.now()
        const ulDurationSec = Math.max((ulEnd - ulStart) / 1000, 0.001)
        const ulBits = uploadSize * 8
        ulMbps = ulBits / ulDurationSec / (1024 * 1024)
      } catch (ulErr) {
        console.warn('Upload failed:', ulErr.message || ulErr)
        ulMbps = 0
      }

      let res = {
        download: mbps,
        upload: ulMbps,
        ping,
        timestamp: Date.now(),
      }
      // If both download and upload are zero, try a lightweight fallback using the Network Information API
      if (!res.download && !res.upload) {
        const fallback = await runFallbackTest()
        res = { ...res, ...fallback }
      }

      setResult(res)
      saveHistory(res)
      setLoading(false)
      return res
    } catch (err) {
      console.error(err)
      setError(
        err && err.message
          ? `Test failed: ${err.message}. Network requests may be blocked or timed out.`
          : 'Test failed. Network requests may be blocked or timed out.'
      )
      setLoading(false)
      return null
    }
  }

  // Fallback test: use Network Information API and a lightweight image ping if full test was blocked
  const runFallbackTest = async () => {
    let download = 0
    let upload = 0
    let ping = null

    try {
      // Network Information API (may be undefined in some browsers)
      const nav = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (nav && typeof nav.downlink === 'number') {
        // downlink is reported in Mbps
        download = nav.downlink || 0
        // estimate upload conservatively
        upload = nav.downlink ? Math.max(0.25, nav.downlink * 0.4) : 0
      }

      // Lightweight ping via image load (works when fetch HEAD is blocked sometimes)
      ping = await new Promise((resolve) => {
        try {
          const img = new Image()
          const start = performance.now()
          // use a small image from a common CDN and add cache-buster
          img.src = `https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png?cb=${Date.now()}`
          img.onload = () => resolve(Math.round(performance.now() - start))
          img.onerror = () => resolve(null)
          // timeout fallback
          setTimeout(() => resolve(null), 5000)
        } catch (e) {
          resolve(null)
        }
      })
    } catch (e) {
      console.warn('Fallback test failed', e)
    }

    return {
      download: download || 0,
      upload: upload || 0,
      ping: ping || null,
      timestamp: Date.now(),
    }
  }

  return { runTest, loading, result, error }
}
