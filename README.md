# 🚀 Internet Speed Visualizer

A modern, interactive web application that measures and visualizes your internet connection speed with real-time graphs and animations. Built with React, Vite, TailwindCSS, Framer Motion, and Chart.js.

## ✨ Features

- **Real-time Speed Testing**: Measures download, upload speeds, and ping/latency
- **Live Fluctuation Graph**: Shows real-time speed variations during test (like Speedtest.net)
- **Circular Speedometer**: Animated gauge displaying current speed
- **Test History**: Stores and displays your last 20 tests in localStorage
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Smooth Animations**: Powered by Framer Motion for fluid UI transitions
- **Modern UI**: Clean, gradient-based design with Tailwind CSS

## 🛠️ Tech Stack

- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Chart.js + react-chartjs-2** - Interactive charts
- **Axios** - HTTP client for speed tests

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd InternetSpeedVisualizer

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

## 🎮 Usage

1. Click the **"Start Test"** button to begin
2. Watch the circular speedometer and live graph as the test runs
3. View your results: Download, Upload, and Ping
4. Click **"Show Previous Tests"** to see your test history
5. Run multiple tests to see fluctuation trends

## 🔧 Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📝 How It Works

The app performs a client-side speed test by:

1. **Ping Test**: Sends a HEAD request to measure latency
2. **Download Test**: Downloads a test file and measures throughput with progress tracking
3. **Upload Test**: Posts data to a test endpoint and measures upload speed
4. **Real-time Updates**: Emits progress events during test to show live fluctuations on the chart
5. **Fallback**: Uses Network Information API if primary tests fail

**Note**: Browser-based speed tests are approximate and affected by browser limitations, CORS policies, and CDN caching. For the most accurate results, use dedicated speed test tools.

## 🎨 Customization

- **Colors**: Edit `tailwind.config.cjs` for custom color schemes
- **Test URLs**: Modify test file URLs in `src/hooks/useSpeedTest.js`
- **Chart Style**: Customize chart options in `src/components/SpeedChart.jsx`
- **Max Speed**: Adjust speedometer range in `src/components/SpeedGauge.jsx`

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using React and modern web technologies
