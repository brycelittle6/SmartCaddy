import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Settings from './Settings'
import Scorecard from './Scorecard'
import Stats from './Stats'
import './App.css'

interface Club {
  name: string
  distance: number
}

function App() {
  const [distance, setDistance] = useState('')
  const [elevation, setElevation] = useState('')
  const [suggestedClub, setSuggestedClub] = useState<Club | null>(null)
  const [clubs, setClubs] = useState<Club[]>([])

  useEffect(() => {
    const storedClubs = localStorage.getItem('clubs')
    if (storedClubs) {
      setClubs(JSON.parse(storedClubs))
    }
  }, [])

  const suggestClub = () => {
    const dist = parseInt(distance, 10)
    const elev = parseInt(elevation, 10)

    if (clubs.length === 0 || isNaN(dist) || isNaN(elev)) {
      setSuggestedClub(null)
      return
    }

    const adjustedDistance = dist + elev

    let closestClub = clubs[0]
    let smallestDifference = Math.abs(adjustedDistance - closestClub.distance)

    clubs.forEach((currentClub) => {
      const currentDifference = Math.abs(adjustedDistance - currentClub.distance)
      if (currentDifference < smallestDifference) {
        smallestDifference = currentDifference
        closestClub = currentClub
      }
    })

    setSuggestedClub(closestClub)
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="app-container">
          <Link to="/scorecard" className="scorecard-link">
            <i className="fa-solid fa-golf-ball-tee"></i> Scorecard
          </Link>

          <Link to="/stats" className="stats-link">
            <i className="fa-solid fa-chart-simple"></i> Stats
        </Link>

          <Link to="/settings" className="settings-link">
            <i className="fa-solid fa-gear"></i>
          </Link>
          <h1>🏌️ Smart Golf Caddy</h1>
          <div className="input-container">
            <input
              type="number"
              value={distance}
              placeholder="Distance to hole (yards)"
              onChange={(e) => setDistance(e.target.value)}
            />
            <input
              type="number"
              value={elevation}
              placeholder="Elevation (+uphill / -downhill yards)"
              onChange={(e) => setElevation(e.target.value)}
            />
            <button onClick={suggestClub}>Suggest Club</button>
          </div>

          {suggestedClub ? (
            <div className="suggestion-card">
              <div className="suggestion-row">
                <span className="label">Suggested Club:</span>
                <span className="value">{suggestedClub.name}</span>
              </div>
              <div className="suggestion-row">
                <span className="label">Club Stock Yardage:</span>
                <span className="value">{suggestedClub.distance} yards</span>
              </div>
              <div className="suggestion-row">
                <span className="label">Actual Distance:</span>
                <span className="value">{distance} yards</span>
              </div>
              <div className="suggestion-row">
                <span className="label">Elevation:</span>
                <span className="value">{elevation} yards</span>
              </div>
              <div className="suggestion-row">
                <span className="label">Adjusted Distance:</span>
                <span className="value">{parseInt(distance, 10) + parseInt(elevation, 10)} yards</span>
              </div>
              <div className="suggestion-row">
                <span className="label">Difference:</span>
                <span className="value">{Math.abs((parseInt(distance, 10) + parseInt(elevation, 10)) - suggestedClub.distance)} yards</span>
              </div>
            </div>
          ) : (
            <p>Ensure club distances are set in the settings and inputs are valid!</p>
          )}
        </div>
      } />
      <Route path="/scorecard" element={<Scorecard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/stats" element={<Stats />} />
    </Routes>
  )
}

export default App