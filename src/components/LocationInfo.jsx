import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function LocationInfo() {
  const [locationData, setLocationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLocationData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchLocationData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Using ipapi.co - free tier, no API key needed
      const response = await fetch('https://ipapi.co/json/')
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data')
      }

      const data = await response.json()
      
      // Map the response to our structure
      const locationInfo = {
        ip: data.ip,
        isp: data.org || 'Unknown ISP',
        city: data.city || 'Unknown',
        region: data.region || '',
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        connectionType: determineConnectionType(data.org),
        timezone: data.timezone || '',
        postal: data.postal || '',
      }

      setLocationData(locationInfo)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching location data:', err)
      setError('Unable to fetch location information')
      setLoading(false)
    }
  }

  const determineConnectionType = (org) => {
    if (!org) return 'Unknown'
    
    const orgLower = org.toLowerCase()
    
    if (orgLower.includes('fiber') || orgLower.includes('fibre')) {
      return 'Fiber'
    } else if (orgLower.includes('mobile') || orgLower.includes('cellular') || orgLower.includes('4g') || orgLower.includes('5g')) {
      return 'Mobile'
    } else if (orgLower.includes('cable')) {
      return 'Cable'
    } else if (orgLower.includes('dsl') || orgLower.includes('adsl')) {
      return 'DSL'
    } else if (orgLower.includes('satellite')) {
      return 'Satellite'
    } else {
      return 'Broadband'
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-800"
      >
        <div className="flex flex-col items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full"
          />
          <p className="mt-4 text-slate-400">Detecting your location...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-800"
      >
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ {error}</div>
          <button
            onClick={fetchLocationData}
            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm text-slate-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  if (!locationData) return null

  const getConnectionColor = (type) => {
    switch (type.toLowerCase()) {
      case 'fiber':
      case 'fibre':
        return 'text-emerald-400'
      case 'mobile':
      case 'cellular':
        return 'text-blue-400'
      case 'cable':
        return 'text-purple-400'
      case 'dsl':
      case 'adsl':
        return 'text-yellow-400'
      case 'satellite':
        return 'text-cyan-400'
      default:
        return 'text-slate-400'
    }
  }

  const getConnectionIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'fiber':
      case 'fibre':
        return '⚡'
      case 'mobile':
      case 'cellular':
        return '📱'
      case 'cable':
        return '🔌'
      case 'dsl':
      case 'adsl':
        return '📞'
      case 'satellite':
        return '🛰️'
      default:
        return '🌐'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-800 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          ISP & Location Insights
        </h2>
        <p className="text-slate-400 text-sm mt-1">Your connection details and approximate location</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left: Connection Details */}
        <div className="space-y-4">
          {/* ISP Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-slate-400 mb-1">Internet Service Provider</div>
                <div className="text-lg font-semibold text-white break-words">
                  {locationData.isp}
                </div>
              </div>
              <div className="text-3xl ml-3">🌐</div>
            </div>
          </motion.div>

          {/* Location Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-slate-400 mb-1">Location</div>
                <div className="text-lg font-semibold text-white">
                  {locationData.city}
                  {locationData.region && `, ${locationData.region}`}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  {locationData.country} {locationData.countryCode && `(${locationData.countryCode})`}
                </div>
              </div>
              <div className="text-3xl ml-3">📍</div>
            </div>
          </motion.div>

          {/* Connection Type Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-slate-400 mb-1">Connection Type</div>
                <div className={`text-lg font-semibold ${getConnectionColor(locationData.connectionType)}`}>
                  {locationData.connectionType}
                </div>
              </div>
              <div className="text-3xl ml-3">{getConnectionIcon(locationData.connectionType)}</div>
            </div>
          </motion.div>

          {/* Additional Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50"
            >
              <div className="text-xs text-slate-400 mb-1">IP Address</div>
              <div className="text-sm font-mono text-emerald-400">{locationData.ip}</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50"
            >
              <div className="text-xs text-slate-400 mb-1">Timezone</div>
              <div className="text-sm text-white">{locationData.timezone || 'Unknown'}</div>
            </motion.div>
          </div>

          {/* Coordinates */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50"
          >
            <div className="text-xs text-slate-400 mb-2">Coordinates</div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-slate-400">Lat:</span>{' '}
                <span className="font-mono text-blue-400">{locationData.latitude.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-slate-400">Long:</span>{' '}
                <span className="font-mono text-blue-400">{locationData.longitude.toFixed(4)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/50 h-[400px] lg:h-full"
        >
          {locationData.latitude && locationData.longitude && (
            <MapContainer
              center={[locationData.latitude, locationData.longitude]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[locationData.latitude, locationData.longitude]}>
                <Popup>
                  <div className="text-center">
                    <div className="font-semibold text-slate-900">{locationData.city}</div>
                    <div className="text-sm text-slate-600">{locationData.country}</div>
                    <div className="text-xs text-slate-500 mt-1">{locationData.isp}</div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </motion.div>
      </div>

      {/* Footer with Refresh Button */}
      <div className="p-4 border-t border-slate-800 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchLocationData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm text-slate-300 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Refresh Location</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
