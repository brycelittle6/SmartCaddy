import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Settings.css'

interface Club {
  name: string
  distance: number
}

function Settings() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [clubName, setClubName] = useState('')
  const [clubDistance, setClubDistance] = useState('')
  const isInitialMount = useRef(true)

  // Load clubs from local storage when component mounts
  useEffect(() => {
    const storedClubs = localStorage.getItem('clubs')
    if (storedClubs) {
      setClubs(JSON.parse(storedClubs))
    }
  }, [])

  // Save clubs to local storage whenever clubs state changes, but NOT on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else {
      localStorage.setItem('clubs', JSON.stringify(clubs))
    }
  }, [clubs])

  const addClub = () => {
    if (clubName && clubDistance && clubs.length < 14) {
      setClubs([...clubs, { name: clubName, distance: parseInt(clubDistance, 10) }])
      setClubName('')
      setClubDistance('')
      setShowPopup(false)
    } else if (clubs.length >= 14) {
      alert('You can only have up to 14 clubs in the bag at a time. Remove a club to add another.')
    }
  }

  const removeClub = (index: number) => {
    setClubs(clubs.filter((_, i) => i !== index))
  }

  return (
    <div className="settings-container">
      <Link to="/" className="back-link">⬅️ Back</Link>
      <h1>⚙️ Settings</h1>
      <div className="yardages-tab">
        <h2>Yardages</h2>
        <button onClick={() => setShowPopup(true)}>Add Club</button>
        <ul>
          {clubs.map((club, index) => (
            <li key={index}>
              {club.name}: {club.distance} yards
              <button onClick={() => removeClub(index)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Club</h3>
            <input
              type="text"
              placeholder="Club Name"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Distance (yards)"
              value={clubDistance}
              onChange={(e) => setClubDistance(e.target.value)}
            />
            <button onClick={addClub}>Save</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings