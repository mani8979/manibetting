import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';

const Placeholder = ({ title }) => {
  return (
    <div>
      <TopBar />
      <div className="hero-section animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 className="hero-heading" style={{ fontSize: '2rem' }}>{title}</h1>
        <p style={{ margin: '1rem auto' }}>
          This page is currently being migrated to React. Check back shortly!
        </p>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/" className="btn btn-primary"><i className="fas fa-home"></i> Go Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Placeholder;
