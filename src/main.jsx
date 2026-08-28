import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import App from './App.jsx'
import './assets/css/style.css'
import './assets/css/games.css'
import './assets/css/animations.css'
import './assets/css/responsive.css'
import './assets/css/home.css'
import './assets/css/profile.css'
import './assets/css/history.css'
import './assets/css/leaderboard.css'
import './assets/css/rewards.css'
import './assets/css/settings.css'
import './assets/css/dice.css'
import './assets/css/coinflip.css'
import './assets/css/auth.css'

gsap.registerPlugin(useGSAP);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
