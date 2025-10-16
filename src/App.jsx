import SpeedTest from './components/SpeedTest'
import LocationInfo from './components/LocationInfo'
import './App.css'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        <SpeedTest />
        <LocationInfo />
      </div>
    </div>
  )
}
