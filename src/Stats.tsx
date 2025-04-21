import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Stats.css'

interface Hole {
  number: number
  par: number
  yardage: number
  score?: number
}

interface Round {
  id: number
  date: string
  course: {
    name: string
  }
  holes: Hole[]
}

function Stats() {
  const [rounds, setRounds] = useState<Round[]>([])

  useEffect(() => {
    const savedRounds = JSON.parse(localStorage.getItem('rounds') || '[]')
    setRounds(savedRounds)
  }, [])

  const calculateStats = () => {
    let par3Scores: number[] = []
    let par4Scores: number[] = []
    let par5Scores: number[] = []
    let totalScores: number[] = []

    rounds.forEach((round) => {
      let roundTotal = 0
      round.holes.forEach((hole) => {
        if (hole.score) {
          roundTotal += hole.score
          if (hole.par === 3) par3Scores.push(hole.score)
          if (hole.par === 4) par4Scores.push(hole.score)
          if (hole.par === 5) par5Scores.push(hole.score)
        }
      })
      totalScores.push(roundTotal)
    })

    const average = (arr: number[]) =>
      arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 'N/A'

    return {
      avgPar3: average(par3Scores),
      avgPar4: average(par4Scores),
      avgPar5: average(par5Scores),
      overallAvg: average([...par3Scores, ...par4Scores, ...par5Scores]),
      totalRounds: rounds.length,
      bestRound: totalScores.length ? Math.min(...totalScores) : 'N/A',
      avgScorePerRound: average(totalScores),
    }
  }

  const stats = calculateStats()

  return (
    <div className="stats-container">
      <Link to="/" className="back-link">⬅️ Back</Link>
      <h1>📊 Your Golf Stats</h1>
      <p>Unfinished rounds will hinder stats!</p>

      <div className="stats-card">
        <div className="stat-row">
          <span className="label">Total Rounds Played:</span>
          <span className="value">{stats.totalRounds}</span>
        </div>
        <div className="stat-row">
          <span className="label">Best Round:</span>
          <span className="value">{stats.bestRound}</span>
        </div>
        <div className="stat-row">
          <span className="label">Average Score per Round:</span>
          <span className="value">{stats.avgScorePerRound}</span>
        </div>
        <div className="stat-row">
          <span className="label">Overall Average Score per Hole:</span>
          <span className="value">{stats.overallAvg}</span>
        </div>
        <div className="stat-row">
          <span className="label">Average Score on Par 3's:</span>
          <span className="value">{stats.avgPar3}</span>
        </div>
        <div className="stat-row">
          <span className="label">Average Score on Par 4's:</span>
          <span className="value">{stats.avgPar4}</span>
        </div>
        <div className="stat-row">
          <span className="label">Average Score on Par 5's:</span>
          <span className="value">{stats.avgPar5}</span>
        </div>
      </div>
    </div>
  )
}

export default Stats