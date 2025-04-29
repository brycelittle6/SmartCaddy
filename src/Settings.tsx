import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Settings.css';

interface Club {
  name: string;
  distance: number;
}

interface GolfBag {
  id: number;
  name: string;
  clubs: Club[];
  isActive: boolean;
}

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme ? savedTheme : 'light'; // Default to light mode
};

function Settings() {
  const [golfBags, setGolfBags] = useState<GolfBag[]>([]);
  const [showAddBagPopup, setShowAddBagPopup] = useState(false);
  const [newBagName, setNewBagName] = useState('');
  const [theme, setTheme] = useState(getInitialTheme);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); // Save theme to localStorage
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Load golf bags from local storage on mount
  useEffect(() => {
    const storedBags = localStorage.getItem('golfBags');
    if (storedBags) {
      try {
        const parsedBags = JSON.parse(storedBags);
        if (Array.isArray(parsedBags)) {
          console.log('Loaded golf bags from localStorage:', parsedBags);
          setGolfBags(parsedBags);
        } else {
          console.error('Invalid data in localStorage, clearing it.');
          localStorage.removeItem('golfBags');
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        localStorage.removeItem('golfBags');
      }
    }
  }, []);



  // Add a new golf bag
  const addGolfBag = () => {
    if (newBagName.trim() === '') {
      alert('Bag name cannot be empty.');
      return;
    }

    const newBag: GolfBag = {
      id: Date.now(), // Unique ID
      name: newBagName,
      clubs: [],
      isActive: golfBags.length === 0, // First bag is active by default
    };

    const updatedBags = [...golfBags, newBag];
    setGolfBags(updatedBags);
    setNewBagName('');
    setShowAddBagPopup(false);

    // Save to localStorage explicitly
    localStorage.setItem('golfBags', JSON.stringify(updatedBags));
  };

  // Set a bag as active
  const setActiveBag = (bagId: number) => {
    const updatedBags = golfBags.map((bag) => ({
      ...bag,
      isActive: bag.id === bagId,
    }));

    setGolfBags(updatedBags);

    // Save to localStorage explicitly
    localStorage.setItem('golfBags', JSON.stringify(updatedBags));
    console.log('Active Bag ID:', bagId);
    console.log('Updated Bags:', updatedBags);
  };

  // Navigate to the bag details page
  const viewBag = (bagId: number) => {
    console.log('Navigating to bag:', bagId); // Debugging
    navigate(`/bag/${bagId}`);
  };

  // Remove a golf bag
  const removeGolfBag = (bagId: number) => {
    if (window.confirm('Are you sure you want to delete this bag? This action cannot be undone.')) {
      const updatedBags = golfBags.filter((bag) => bag.id !== bagId);

      // If the deleted bag was active, set the first bag as active (if any remain)
      if (updatedBags.length > 0 && !updatedBags.some((bag) => bag.isActive)) {
        updatedBags[0].isActive = true;
      }

      setGolfBags(updatedBags);

      // Save to localStorage explicitly
      localStorage.setItem('golfBags', JSON.stringify(updatedBags));
    }
  };

  // Reset the application (clear all data)
  const resetApplication = () => {
    if (golfBags.length === 0) {
      alert('No data to reset.');
      return;
    }

    if (window.confirm('Are you sure you want to reset the application? This will remove all data.')) {
      console.log('Resetting application data...'); // Debugging
      localStorage.clear();
      setGolfBags([]);
    }
  };

  return (
    <div className="settings-container">
      <Link to="/" className="back-link">⬅️ Back</Link>
      <h1>⚙️ Settings</h1>

      {/* Golf Bags Section */}
      <div className="golf-bags-section">
        <h2>Golf Bags</h2>
        <button onClick={() => setShowAddBagPopup(true)}>Add Bag</button>
        <ul>
          {golfBags.map((bag) => (
            <li key={bag.id}>
              <strong>{bag.name}</strong> {bag.isActive && '(Active)'}
              <button onClick={() => setActiveBag(bag.id)}>Set Active</button>
              <button onClick={() => viewBag(bag.id)}>View Bag</button>
              <button onClick={() => removeGolfBag(bag.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Preferences Section */}
      <div className="preferences-section">
        <h2>Preferences</h2>
        <div>
          <label htmlFor="theme-toggle">Theme:</label>
          <button id="theme-toggle" onClick={toggleTheme}>
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>
      </div>

      {/* Reset Application Section */}
      <div className="reset-section">
        <h2>Reset Application</h2>
        <button onClick={resetApplication}>Reset</button>
      </div>

      {/* Add Bag Popup */}
      {showAddBagPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Golf Bag</h3>
            <input
              type="text"
              placeholder="Bag Name"
              value={newBagName}
              onChange={(e) => setNewBagName(e.target.value)}
            />
            <button onClick={addGolfBag}>Save</button>
            <button onClick={() => setShowAddBagPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;