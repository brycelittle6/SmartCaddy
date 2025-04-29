import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Settings from './Settings'
import Scorecard from './Scorecard'
import Stats from './Stats'
import BagDetails from './BagDetails'
import { GolfBag } from './BagDetails'
import './App.css'

interface Club {
  name: string
  distance: number
  feedback?: {
    lastAdjustedDistance?: number
    wasGood?: boolean
    badFeedback?: {
      tooLong?: boolean
      tooShort?: boolean
      strikeQuality?: 'Great' | 'Good' | 'Poor'
    }
  }
}

function App() {
  const [distance, setDistance] = useState('')
  const [elevation, setElevation] = useState('')
  const [suggestedClub, setSuggestedClub] = useState<Club | null>(null)
  const [clubs, setClubs] = useState<Club[]>([])
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [badFeedback, setBadFeedback] = useState<{
    tooLong?: boolean
    tooShort?: boolean
    strikeQuality?: 'Great' | 'Good' | 'Poor'
  }>({})

  // Load clubs from local storage on mount
  useEffect(() => {
    const storedBags = localStorage.getItem('golfBags');
    if (storedBags) {
      const parsedBags = JSON.parse(storedBags);
      const activeBag = parsedBags.find((bag: GolfBag) => bag.isActive);
      if (activeBag) {
        setClubs(activeBag.clubs);
      } else {
        console.error('No active bag found.');
      }
    }
  }, []);

  // Suggest a club based on distance and feedback
  const suggestClub = () => {
    const dist = parseInt(distance, 10);
    const rawElev = parseInt(elevation, 10);
    const elevOffset = isNaN(rawElev) ? 0 : rawElev;

    if (clubs.length === 0 || isNaN(dist)) {
      setSuggestedClub(null);
      alert('Please ensure you have an active bag with clubs and a valid distance.');
      return;
    }

    const adjustedDistance = dist + elevOffset;

    let closestClub = clubs[0];
    let smallestDifference = Math.abs(adjustedDistance - closestClub.distance);
  
    clubs.forEach((currentClub) => {
      const currentDifference = Math.abs(adjustedDistance - currentClub.distance);
      if (currentDifference < smallestDifference) {
        smallestDifference = currentDifference;
        closestClub = currentClub;
      }
    });
  
    setSuggestedClub(closestClub);
    setFeedbackGiven(false); 
  };  

  // Handle "Good" Feedback
  const handleGoodFeedback = () => {
    if (!suggestedClub) return;

    const rawElev = parseInt(elevation, 10);
    const elevOffset = isNaN(rawElev) ? 0 : rawElev;
    const dist = parseInt(distance, 10);
    const adjustedDistance = dist + elevOffset;

    const updatedClubs = clubs.map((club) => {
      if (club.name === suggestedClub.name) {
        return {
          ...club,
          feedback: {
          wasGood: true,
          lastAdjustedDistance: adjustedDistance,
        },
      };
    }
    return club;
  });

  setClubs(updatedClubs);

  const allBags = JSON.parse(localStorage.getItem('golfBags') || '[]');
  const newBags = allBags.map((bag: any) =>
    bag.isActive
      ? { ...bag, clubs: updatedClubs }
      : bag
  );
  localStorage.setItem('golfBags', JSON.stringify(newBags));

  setFeedbackGiven(true);
};


  // Handle "Bad" Feedback
  const handleBadFeedback = () => {
    const rawElev = parseInt(elevation, 10);
    const elevOffset = isNaN(rawElev) ? 0 : rawElev;
    if (!suggestedClub || Object.keys(badFeedback).length === 0) {
      console.error("Incomplete bad feedback data. Cannot submit feedback.");
      return;
    }
  
    // Calculate the adjusted distance
    const adjustedDistance = parseInt(distance, 10) + elevOffset;
  
    // Update the club with the bad feedback and adjusted distance
    const updatedClubs = clubs.map((club) => {
      if (club.name === suggestedClub.name) {
        return {
          ...club,
          feedback: {
            ...club.feedback,
            wasGood: false,
            lastAdjustedDistance: adjustedDistance, 
            badFeedback: badFeedback,
          },
        };
      }
      return club;
    });
  
    // Save the updated club data to state and local storage
    setClubs(updatedClubs);
    localStorage.setItem("clubs", JSON.stringify(updatedClubs));
    setFeedbackGiven(true); // Prevent multiple feedbacks for the same suggestion
    setBadFeedback({}); // Reset the bad feedback state
    console.log("Bad feedback submitted:", badFeedback);
  };
  

  return (
    <Routes>
      <Route
        path="/"
        element={
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
            <h1>🏌️‍♂️ Smart Golf Caddy</h1>
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
                placeholder="Elevation (yards)"
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
                  <span className="label">Adjusted Distance:</span>
                  <span className="value">{ (parseInt(distance, 10) || 0) + (parseInt(elevation, 10) || 0) } yards</span>
                </div>
                {suggestedClub.feedback && suggestedClub.feedback.wasGood ? (
                  <p>
                    The last time you used the <b>{suggestedClub.name}</b>, it was a perfect shot from{' '}
                    <b>{suggestedClub.feedback.lastAdjustedDistance} yards</b>. It'll be a good club to use!
                    </p>
                ) : suggestedClub.feedback && suggestedClub.feedback.badFeedback ? (
                  <p>
                    The last time you used the <b>{suggestedClub.name}</b>, it was{' '}
                    {suggestedClub.feedback.badFeedback.tooLong ? 'too long' : 'too short'} with a{' '}
                    {suggestedClub.feedback.badFeedback.strikeQuality === 'Great'
                      ? 'Great'
                      : suggestedClub.feedback.badFeedback.strikeQuality === 'Good'
                      ? 'Good'
                      : 'Poor'}{' '}
                    strike from <b>{suggestedClub.feedback.lastAdjustedDistance || 'unknown'} yards</b>. Take this into consideration!
                  </p>
                ) : null}


                {!feedbackGiven ? (
                  <>
                    <button onClick={handleGoodFeedback}>✔️ Good Suggestion</button>
                    <button onClick={() =>setBadFeedback({ tooShort: true, tooLong: false, strikeQuality: 'Great' })
                  }
                >
                ❌Bad Suggestion
                </button>

                {Object.keys(badFeedback).length > 0 && (
                  <div className="bad-feedback-form">
                    <div className="bad-feedback-distance">
                      <button
                        className={badFeedback.tooShort ? 'active' : ''}
                        onClick={() => setBadFeedback(prev => ({ ...prev, tooShort: true, tooLong: false }))}
                      >
                        Too Short
                      </button>
                      <button
                        className={badFeedback.tooLong ? 'active' : ''}
                        onClick={() => setBadFeedback(prev => ({ ...prev, tooLong: true, tooShort: false }))}
                      >
                        Too Long
                      </button>
                   </div>

                    <div className="bad-feedback-strike">
                      <label htmlFor="strike-quality-select">Strike Quality:</label>
                      <select
                        id="strike-quality-select"
                        value={badFeedback.strikeQuality}
                        onChange={e =>
                          setBadFeedback(prev => ({
                            ...prev,
                            strikeQuality: e.target.value as 'Great' | 'Good' | 'Poor'
                          }))
                        }
                      >
                        <option value="Great">Great</option>
                        <option value="Good">Good</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>

                    <button
                      onClick={handleBadFeedback}
                      disabled={!badFeedback.tooShort && !badFeedback.tooLong}
                    >
                      Submit Feedback
                    </button>
                  </div>
                )}

                  </>
                ) : (
                  <p>Thank you for your feedback!</p>
                )}
              </div>
            ) : (
              <p>Ensure club distances are set in the settings and inputs are valid! Refresh the page if no club data is found!</p>
            )}
          </div>
        }
      />
      <Route path="/scorecard" element={<Scorecard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/bag/:bagId" element={<BagDetails />} />
    </Routes>
  )
}

export default App