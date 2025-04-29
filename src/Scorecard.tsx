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

interface ApiResponseCourse {
  id: number;
  club_name: string;
  course_name: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  tees: {
    [teeType: string]: Array<{
      tee_name: string;
      course_rating: number;
      slope_rating: number;
      bogey_rating: number;
      total_yards: number;
      total_meters: number;
      number_of_holes: number;
      par_total: number;
      front_course_rating: number;
      front_slope_rating: number;
      front_bogey_rating: number;
      back_course_rating: number;
      back_slope_rating: number;
      back_bogey_rating: number;
      holes: Array<{
        number: number;
        par: number;
        yardage: number;
        handicap?: number;
      }>;
    }>;
  };
}

interface Tee {
  tee_name: string;
  holes: Hole[];
}

interface Course {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
  tees: Tee[];
}

function Scorecard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentRound, setCurrentRound] = useState<Hole[]>([])
  const [rounds, setRounds] = useState<any[]>([])
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [selectedTee, setSelectedTee] = useState<Tee | null>(null);

  // Function to search courses by name
  const searchCourses = async () => {
    try {
      const response = await fetch(`https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': 'Key PLGHXYDRKIUPV4VM56ES6WID7Y'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('API Response:', data);
  
      if (data.courses && Array.isArray(data.courses)) {
        const formattedCourses: (Course | null)[] = data.courses.map((apiCourse: ApiResponseCourse) => {
          const maleTees = apiCourse.tees.male;
  
          if (!maleTees || !maleTees.length) {
            console.error('Male tees or holes are undefined for course:', apiCourse);
            return null;
          }
  
          const holes = maleTees[0].holes.map(hole => ({
            number: hole.number,
            par: hole.par,
            yardage: hole.yardage
          }));

          const tees = maleTees.map((tee) => ({
            tee_name: tee.tee_name,
            holes: tee.holes.map((hole, index) => ({
              number: index + 1,
              par: hole.par,
              yardage: hole.yardage,
            })),
          }));
        
          return {
            id: apiCourse.id,
            name: apiCourse.course_name,
            city: apiCourse.location.city,
            state: apiCourse.location.state,
            country: apiCourse.location.country,
            tees,
            holes,
          };
        });

  
        const validCourses = formattedCourses.filter((course): course is Course => course !== null);
        console.log('Formatted Courses:', validCourses);
        setCourses(validCourses);
  
        if (validCourses.length === 0) {
          alert('No courses found.');
        }
      } else {
        setCourses([]);
        alert('No courses found.');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses. Please check your API key and endpoint.');
    }
  };

  // Function to select a course and load its details
  const selectCourse = (course: Course) => {
    if (course && course.tees.length > 0) {
      setSelectedCourse(course);
      setSelectedTee(course.tees[0]); 
      setCurrentRound(
        course.tees[0].holes.map((hole) => ({
          ...hole,
          score: undefined,
        }))
      );
    } else {
      console.error('Course or tees are undefined:', course);
      alert('Course details are incomplete.');
    }
  };

  // Function to update scores
  const updateScore = (index: number, score: number) => {
    const updatedRound = [...currentRound]
    updatedRound[index].score = score
    setCurrentRound(updatedRound)
  }

  // Function to save the round
  const saveRound = () => {
    const savedRounds = JSON.parse(localStorage.getItem('rounds') || '[]');
  
    if (selectedRoundId) {
      const updatedRounds = savedRounds.map((round: any) =>
        round.id === selectedRoundId
          ? {
              ...round,
              date: new Date(),
              course: selectedCourse,
              tee: selectedTee?.tee_name,
              holes: currentRound,
            }
          : round
      );
      localStorage.setItem('rounds', JSON.stringify(updatedRounds));
      setRounds(updatedRounds);
      alert('Round updated!');
    } else {
      const newRound = {
        id: Date.now(),
        date: new Date(),
        course: selectedCourse,
        tee: selectedTee?.tee_name,
        holes: currentRound,
      };
      savedRounds.push(newRound);
      localStorage.setItem('rounds', JSON.stringify(savedRounds));
      setRounds(savedRounds);
      alert('Round saved!');
    }
  
    setSelectedRoundId(null);
  };


  const deleteRound = (id: number) => {
    if (window.confirm('Are you sure you want to delete this round?')) {
      const updatedRounds = rounds.filter((round) => round.id !== id);
      localStorage.setItem('rounds', JSON.stringify(updatedRounds));
      setRounds(updatedRounds);
      alert('Round deleted!');
  
      if (selectedRoundId === id) {
        setSelectedCourse(null);
        setCurrentRound([]);
        setSelectedRoundId(null);
      }
    }
  };


  const loadRound = (id: number) => {
    const roundToLoad = rounds.find((round) => round.id === id);
    if (roundToLoad) {
      setSelectedCourse(roundToLoad.course);
      const teeToLoad = roundToLoad.course.tees.find((tee: Tee) => tee.tee_name === roundToLoad.tee);
      if (teeToLoad) {
        setSelectedTee(teeToLoad);
        setCurrentRound(roundToLoad.holes);
        setSelectedRoundId(id);
      } else {
        alert('Tee information missing for this round.');
      }
    }
  };

  const handleTeeChange = (teeName: string) => {
    if (!selectedCourse) return;
  
    const newTee = selectedCourse.tees.find((tee) => tee.tee_name === teeName);
    if (newTee) {
      setSelectedTee(newTee);
      setCurrentRound(
        newTee.holes.map((hole) => ({
          ...hole,
          score: undefined,
        }))
      );
    }
  };

  // Load past rounds from local storage on mount
  useEffect(() => {
    const savedRounds = JSON.parse(localStorage.getItem('rounds') || '[]').map((round: any) => ({
      ...round,
      id: round.id || Date.now() + Math.random(), 
    }));
    setRounds(savedRounds);
  }, []);

  return (
    <div className="scorecard-container">
      <Link to="/" className="back-link">⬅️ Back</Link>
      <h1>Scorecard</h1>
  
      <div className="course-search">
        <input
          type="text"
          id="search-term"
          name="search-term"
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
  
      {selectedCourse && selectedTee &&(
        <div className="scorecard">
        <h2>{selectedCourse.name} Scorecard</h2>
    
        <div className="tee-selection">
          <label htmlFor="tee-select">Select Tee: </label>
          <select
            id="tee-select"
            value={selectedTee.tee_name}
            onChange={(e) => handleTeeChange(e.target.value)}
          >
            {selectedCourse.tees.map((tee) => (
              <option key={tee.tee_name} value={tee.tee_name}>
                {tee.tee_name}
              </option>
            ))}
          </select>
        </div>

          <table className="scorecard-table">
            <thead>
              <tr>
                <th>Hole</th>
                <th>Par</th>
                <th>Yardage</th>
                <th>Your Score</th>
              </tr>
            </thead>
            <tbody>
              {currentRound.map((hole, index) => (
                <tr key={`hole-${index}`}>
                  <td>{hole.number}</td>
                  <td>{hole.par}</td>
                  <td>{hole.yardage}</td>
                  <td>
                    <input
                      type="number"
                      id={`hole-${hole.number}`}
                      name={`hole-${hole.number}`}
                      placeholder="-"
                      value={hole.score || ''}
                      onChange={(e) => updateScore(index, parseInt(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="save-round-btn" onClick={saveRound}>Save Round</button>
        </div>
      )}
  
      <div className="past-rounds">
        <h2>Past Rounds</h2>
        {rounds.map((round) => (
          <div key={round.id} className="round-card">
            <div className="round-info" onClick={() => loadRound(round.id)}>
              <strong>{round.course.name}</strong>
              <span>{new Date(round.date).toLocaleString()}</span>
            </div>
            <button className="delete-btn" onClick={() => deleteRound(round.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Scorecard