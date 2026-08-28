import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PlayZoneProvider } from './context/PlayZoneContext';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';

import Home from './pages/Home';
import Profile from './pages/Profile';
import Games from './pages/Games';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import Wallet from './pages/Wallet';
import Dice from './pages/games/Dice';
import Coinflip from './pages/games/Coinflip';
import Placeholder from './pages/Placeholder';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <PlayZoneProvider>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/games" element={<Games />} />
              <Route path="/history" element={<History />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Game Routes */}
              <Route path="/dice" element={<Dice />} />
              <Route path="/coinflip" element={<Coinflip />} />
              <Route path="/wheel" element={<Placeholder title="Lucky Wheel" />} />
              <Route path="/mines" element={<Placeholder title="Mines" />} />
              <Route path="/cards" element={<Placeholder title="Card Duel" />} />
              
              {/* Pages currently under migration */}
              <Route path="/sports" element={<Placeholder title="Sports Simulator" />} />
              <Route path="/numberguess" element={<Placeholder title="Number Guess" />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      </PlayZoneProvider>
    </AuthProvider>
  );
}

export default App;
