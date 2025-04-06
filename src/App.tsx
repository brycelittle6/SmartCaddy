import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Settings from './Settings'
import './App.css'

interface Club {
  name: string
  distance: number
}

function App() {
  const [distance, setDistance] = useState('')
  const [suggestedClub, setSuggestedClub] = useState<Club | null>(null)
  const [clubs, setClubs] = useState<Club[]>([])

  // Load clubs from local storage on mount
  useEffect(() => {
    const storedClubs = localStorage.getItem('clubs')
    if (storedClubs) {
      setClubs(JSON.parse(storedClubs))
    }
  }, [])

  const suggestClub = () => {
    const dist = parseInt(distance, 10)
    if (clubs.length === 0) {
      setSuggestedClub(null)
      return
    }

    // Find the closest club
    let closestClub = clubs[0]
    let smallestDifference = Math.abs(dist - closestClub.distance)

    clubs.forEach((currentClub) => {
      const currentDifference = Math.abs(dist - currentClub.distance)
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
          <Link to="/settings" className="settings-link">⚙️</Link>
          <h1>🏌️ Smart Golf Caddy</h1>
          <div className="input-container">
            <input
              type="number"
              value={distance}
              placeholder="Enter distance to hole (yards)"
              onChange={(e) => setDistance(e.target.value)}
            />
            <button onClick={suggestClub}>Suggest Club</button>
          </div>

          {suggestedClub ? (
            <table className="suggestion-table">
              <thead>
                <tr>
                  <th>Suggested Club</th>
                  <th>Club Stock Yardage</th>
                  <th>Distance to Hole</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{suggestedClub.name}</td>
                  <td>{suggestedClub.distance} yards</td>
                  <td>{distance} yards</td>
                  <td>{Math.abs(parseInt(distance, 10) - suggestedClub.distance)} yards</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No clubs set. Please add clubs in settings.</p>
          )}
        </div>
      } />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App