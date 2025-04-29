import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Settings.css';

interface Club {
  name: string;
  distance: number;
}

export interface GolfBag {
  id: number;
  name: string;
  clubs: Club[];
  isActive: boolean;
}


function BagDetails() {
  const { bagId } = useParams<{ bagId: string }>();
  const [golfBags, setGolfBags] = useState<GolfBag[]>([]);
  const [currentBag, setCurrentBag] = useState<GolfBag | null>(null);
  const [clubName, setClubName] = useState('');
  const [clubDistance, setClubDistance] = useState('');

  // Load golf bags from local storage on mount
  useEffect(() => {
    const storedBags = localStorage.getItem('golfBags');
    if (storedBags) {
      try {
        const parsedBags = JSON.parse(storedBags);
        if (Array.isArray(parsedBags)) {
          console.log('Loaded golf bags from localStorage:', parsedBags);
          setGolfBags(parsedBags);

          const bag = parsedBags.find((b: GolfBag) => b.id === Number(bagId));
          setCurrentBag(bag || null);
        } else {
          console.error('Invalid data in localStorage, clearing it.');
          localStorage.removeItem('golfBags');
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        localStorage.removeItem('golfBags');
      }
    }
  }, [bagId]);

  // Add a club to the current bag
  const addClub = () => {
    if (!currentBag || clubName.trim() === '' || !clubDistance) {
      alert('Please fill out all fields.');
      return;
    }

    const updatedBags = golfBags.map((bag) =>
      bag.id === currentBag.id
        ? {
            ...bag,
            clubs: [
              ...bag.clubs,
              { name: clubName, distance: parseInt(clubDistance, 10) },
            ],
          }
        : bag
    );

    setGolfBags(updatedBags);

    // Update the current bag state to reflect the new club
    const updatedCurrentBag = {
      ...currentBag,
      clubs: [
        ...currentBag.clubs,
        { name: clubName, distance: parseInt(clubDistance, 10) },
      ],
    };
    setCurrentBag(updatedCurrentBag);

    // Save to localStorage explicitly
    localStorage.setItem('golfBags', JSON.stringify(updatedBags));

    // Clear input fields
    setClubName('');
    setClubDistance('');
  };

  // Remove a club from the current bag
  const removeClub = (index: number) => {
    if (!currentBag) return;

    const updatedBags = golfBags.map((bag) =>
      bag.id === currentBag.id
        ? {
            ...bag,
            clubs: bag.clubs.filter((_, i) => i !== index),
          }
        : bag
    );

    setGolfBags(updatedBags);

    // Update the current bag state to reflect the removed club
    const updatedCurrentBag = {
      ...currentBag,
      clubs: currentBag.clubs.filter((_, i) => i !== index),
    };
    setCurrentBag(updatedCurrentBag);

    // Save to localStorage explicitly
    localStorage.setItem('golfBags', JSON.stringify(updatedBags));
  };

  if (!currentBag) {
    return (
      <div className="settings-container">
        <p>Bag not found.</p>
        <Link to="/settings">⬅️ Back to Settings</Link>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <Link to="/settings" className="back-link">⬅️ Back</Link>
      <h1>{currentBag.name}</h1>

      <h2>Clubs</h2>
      <ul>
        {currentBag.clubs.map((club, index) => (
          <li key={index}>
            {club.name}: {club.distance} yards
            <button onClick={() => removeClub(index)}>Remove</button>
          </li>
        ))}
      </ul>

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
      <button onClick={addClub}>Add Club</button>
    </div>
  );
}

export default BagDetails;
