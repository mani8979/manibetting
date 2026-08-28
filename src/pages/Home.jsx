import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import TopBar from '../components/layout/TopBar';

const Home = () => {
  const container = useRef(null);
  const [introPlayed, setIntroPlayed] = useState(() => sessionStorage.getItem('introPlayed') === 'true');

  useGSAP(() => {
    if (introPlayed) {
      gsap.set(".hero-heading", { visibility: "visible" });
      return;
    }

    const title = new SplitType(".intro-title", { types: 'words, chars' });
    const splitHeading = new SplitType(".hero-heading", { types: 'words, chars' });
    const counter = document.querySelector(".count p");

    gsap.set(".intro-card", {
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      rotate: (i) => [8, -3, -10, 10, -7, 5][i],
    });

    gsap.set([title.chars, splitHeading.chars], {
      yPercent: 100,
      rotation: 10,
      transformOrigin: "0% 100%",
      opacity: 0
    });

    gsap.set(".count p", { yPercent: 100 });

    const tl = gsap.timeline({ delay: 0.5 });

    tl.to(".intro-card", {
      scale: 1,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1,
      ease: "power3.inOut",
      stagger: 0.2,
    });

    tl.set(".brand", { visibility: "visible" }, 0.35);

    tl.to(title.chars, {
      yPercent: 0,
      rotation: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      stagger: 0.04,
    }, 0.35);

    tl.to(".count p", { yPercent: 0, duration: 1, ease: "power3.out" }, "<");

    tl.to({ value: 0 }, {
      value: 100,
      duration: 2,
      ease: "power2.inOut",
      onUpdate() {
        if (counter) counter.textContent = String(Math.round(this.targets()[0].value)).padStart(3, "0");
      },
    }, "<0.5");

    tl.to(title.chars, {
      yPercent: -100,
      rotation: -10,
      opacity: 0,
      duration: 0.75,
      ease: "power3.in",
      stagger: 0.04,
    }, 3.25);

    tl.to(".count p", { yPercent: -100, duration: 0.75, ease: "power3.in" }, 3.25);

    tl.to(".intro-card", {
      scale: 0,
      clipPath: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
      duration: 1,
      ease: "power3.inOut",
      stagger: -0.075,
    }, 3.5);

    tl.to(".loader", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(".loader", { display: 'none' });
      }
    }, 4.35);

    tl.set(".hero-heading", { visibility: "visible" }, 4.65);

    tl.to(splitHeading.chars, {
      yPercent: 0,
      rotation: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
      stagger: 0.01,
      onComplete: () => {
        sessionStorage.setItem('introPlayed', 'true');
        setIntroPlayed(true);
      }
    }, 4.65);

    return () => {
      if (title.revert) title.revert();
      if (splitHeading.revert) splitHeading.revert();
    }
  }, { scope: container });

  return (
    <div ref={container}>
      {!introPlayed && (
        <div className="loader">
          <div className="intro-card"><img src="https://deckofcardsapi.com/static/img/AS.png" alt="Card 1" /></div>
          <div className="intro-card"><img src="https://deckofcardsapi.com/static/img/KD.png" alt="Card 2" /></div>
          <div className="intro-card"><img src="https://deckofcardsapi.com/static/img/QC.png" alt="Card 3" /></div>
          <div className="intro-card"><img src="https://deckofcardsapi.com/static/img/JH.png" alt="Card 4" /></div>
          <div className="intro-card"><img src="https://deckofcardsapi.com/static/img/0S.png" alt="Card 5" /></div>
          <div className="intro-card"><img src="https://deckofcardsapi.com/static/img/aceDiamonds.png" alt="Card 6" /></div>

          <div className="brand">
            <h1 className="intro-title">PLAYZONE</h1>
            <div className="count"><p>000</p></div>
          </div>
        </div>
      )}

      <TopBar />
      
      <div className="hero-section animate-fade-in">
        <h1 className="hero-heading" style={{ visibility: introPlayed ? 'visible' : 'hidden' }}>Play. Predict. Win Real Cash.</h1>
        <p>Challenge yourself across exciting games and build your cash balance. Withdraw your winnings securely at any time.</p>
        <div className="hero-actions">
          <Link to="/games" className="btn btn-primary"><i className="fas fa-play"></i> Explore Games</Link>
          <Link to="/rewards" className="btn btn-secondary"><i className="fas fa-gift"></i> Daily Reward</Link>
        </div>
      </div>
      
      <h2 className="section-title"><i className="fas fa-star" style={{ color: 'var(--accent-gold)' }}></i> Featured Games</h2>

      <div className="grid-cards">
        
        <Link to="/dice" className="game-card animate-fade-in" style={{ '--card-accent': 'var(--accent-primary)', animationDelay: '0.1s' }}>
          <div className="game-card-img"><i className="fas fa-dice-d6"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Dice Roll</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Table</span></span> <span>Popularity: <span className="card-stat-highlight">High</span></span></div>
            <div className="game-card-desc">Roll the virtual 3D dice and win big multipliers!</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
        <Link to="/wheel" className="game-card animate-fade-in" style={{ '--card-accent': '#f59e0b', animationDelay: '0.2s' }}>
          <div className="game-card-img"><i className="fas fa-dharmachakra"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Lucky Wheel</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Spin</span></span> <span>Popularity: <span className="card-stat-highlight">High</span></span></div>
            <div className="game-card-desc">Spin the fortune wheel for massive cash rewards.</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
        <Link to="/mines" className="game-card animate-fade-in" style={{ '--card-accent': '#ef4444', animationDelay: '0.3s' }}>
          <div className="game-card-img"><i className="fas fa-bomb"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Mines</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Grid</span></span> <span>Popularity: <span className="card-stat-highlight">Very High</span></span></div>
            <div className="game-card-desc">Navigate the grid to collect rewards without hitting a mine!</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
        <Link to="/cards" className="game-card animate-fade-in" style={{ '--card-accent': '#8b5cf6', animationDelay: '0.4s' }}>
          <div className="game-card-img"><i className="fas fa-layer-group"></i></div>
          <div className="game-card-content">
            <div className="game-card-title">Card Duel</div>
            <div className="card-stats"><span>Category: <span className="card-stat-highlight">Table</span></span> <span>Popularity: <span className="card-stat-highlight">High</span></span></div>
            <div className="game-card-desc">Draw a card and beat the house in this classic duel.</div>
            <button className="game-card-play">Play Now</button>
          </div>
        </Link>
        
      </div>
    </div>
  );
};

export default Home;
