import React from 'react';
import { Link } from 'react-router-dom';
import { usePlayZone } from '../context/PlayZoneContext';
import TopBar from '../components/layout/TopBar';

const History = () => {
  const { history } = usePlayZone();

  return (
    <div>
      <TopBar />
      <div className="history-container animate-fade-in">
        <h2 className="section-title"><i className="fas fa-history" style={{ color: 'var(--accent-primary)' }}></i> Transaction History</h2>
        
        <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
          {history.length > 0 ? (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Game / Action</th>
                  <th>Result</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{h.game}</td>
                    <td className={`res-${h.result.toLowerCase()}`}>{h.result}</td>
                    <td>{h.result === 'Win' || h.result === 'Reward' ? '+' : '-'}₹{h.amount.toFixed(2)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {h.date} {new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <h3>No history yet</h3>
              <p>Play some games to see your history here.</p>
              <Link to="/games" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Play Now</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
