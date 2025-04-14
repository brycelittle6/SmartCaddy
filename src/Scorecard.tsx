import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Scorecard.css'

interface Hole {
  number: number
  par: number
  yardage: number
  score?: number
}

interface Course {
  id: number
  name: string
  city: string
  state: string
  country: string
  holes: Hole[]
}

function Scorecard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentRound, setCurrentRound] = useState<Hole[]>([])
  const [rounds, setRounds] = useState<any[]>([])

  // Function to search courses by name
  const searchCourses = async () => {
    try {
      const response = await fetch(`/api/v1/courses?name=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': 'Key PLGHXYDRKIUPV4VM56ES6WID7Y'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCourses(data.courses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      alert('Failed to fetch courses. Please check your API key and endpoint.')
    }
  }

  // Function to select a course and load its details
  const selectCourse = (course: Course) => {
    setSelectedCourse(course)
    setCurrentRound(course.holes.map(hole => ({ ...hole, score: undefined })))
  }

  // Function to update scores
  const updateScore = (index: number, score: number) => {
    const updatedRound = [...currentRound]
    updatedRound[index].score = score
    setCurrentRound(updatedRound)
  }

  // Function to save the round
  const saveRound = () => {
    const savedRounds = JSON.parse(localStorage.getItem('rounds') || '[]')
    savedRounds.push({ date: new Date(), course: selectedCourse, holes: currentRound })
    localStorage.setItem('rounds', JSON.stringify(savedRounds))
    setRounds(savedRounds)
    alert('Round saved!')
  }

  // Load past rounds from local storage on mount
  useEffect(() => {
    const savedRounds = JSON.parse(localStorage.getItem('rounds') || '[]')
    setRounds(savedRounds)
  }, [])

  return (
    <div className="scorecard-container">
      <Link to="/" className="back-link">⬅️ Back</Link>
      <h1>🏅 Scorecard</h1>

      <div className="course-search">
        <input
          type="text"
          placeholder="Search Course by Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={searchCourses}>Search</button>
      </div>

      <div className="course-results">
        {courses.map((course) => (
          <div key={course.id} className="course-item">
            <strong>{course.name}</strong> - {course.city}, {course.state}, {course.country}
            <button onClick={() => selectCourse(course)}>Select</button>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div className="scorecard">
          <h2>{selectedCourse.name} Scorecard</h2>
          {currentRound.map((hole, index) => (
            <div key={hole.number} className="hole">
              <span>Hole {hole.number} (Par {hole.par}, {hole.yardage} yards):</span>
              <input
                type="number"
                placeholder="Score"
                value={hole.score || ''}
                onChange={(e) => updateScore(index, parseInt(e.target.value))}
              />
            </div>
          ))}
          <button onClick={saveRound}>Save Round</button>
        </div>
      )}

      <div className="past-rounds">
        <h2>Past Rounds</h2>
        {rounds.map((round, idx) => (
          <div key={idx} className="round">
            <strong>{new Date(round.date).toLocaleString()}</strong> - {round.course.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Scorecard