import React, { useState } from 'react';
import { usePlayZone } from '../context/PlayZoneContext';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/layout/TopBar';
import PaymentModal from '../components/payment/PaymentModal';
import AuthModal from '../components/auth/AuthModal';

const Profile = () => {
  const { balance, stats, history, userProfile, setUserProfile, streaks } = usePlayZone();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const avatars = ['🎮', '🧑', '👾', '🦊', '🤖', '⭐', '👽', '👻'];

  const openEditModal = () => {
    setEditName(userProfile.username || user?.name || '');
    setSelectedAvatar(userProfile.avatar);
    setIsEditModalOpen(true);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    setUserProfile(prev => ({
      ...prev,
      username: editName.trim(),
      avatar: selectedAvatar
    }));
    setIsEditModalOpen(false);
  };

  const favGame = history.length > 0
    ? Object.entries(history.reduce((acc, h) => {
        acc[h.game] = (acc[h.game] || 0) + 1;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const cashEarned = history.filter(h => h.result === 'Win').reduce((sum, h) => sum + h.amount, 0);
  const cashSpent = history.filter(h => h.result === 'Loss').reduce((sum, h) => sum + h.amount, 0);
  const netCash = cashEarned - cashSpent;
  const xpProgress = (userProfile.xp / (userProfile.level * 1000)) * 100;
  const displayName = userProfile.username || user?.name || 'Player';
  const displayHandle = userProfile.handle || (user ? '@' + user.name.toLowerCase().replace(/\s+/g, '') : '@player');

  return (
    <div>
      <TopBar />

      {/* Not logged in gate */}
      {!user ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '5rem' }}>🔒</div>
          <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Login to View Your Profile</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '320px' }}>Track your stats, win streaks, and coin performance by creating a free account.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="btn btn-primary"
            style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}
          >
            <i className="fas fa-sign-in-alt"></i> Login / Sign Up
          </button>
        </div>
      ) : (
        <div className="profile-dashboard animate-fade-in">

          <div className="profile-left-col">
            {/* Identity Card */}
            <div className="profile-card profile-identity">
              <button className="edit-profile-btn" onClick={openEditModal}><i className="fas fa-pen"></i></button>
              <div className="avatar-container">
                <div className="profile-avatar">{userProfile.avatar}</div>
                <div className="status-dot"></div>
              </div>
              <div className="profile-name">{displayName}</div>
              <div className="profile-handle">{displayHandle}</div>
              <div className="role-badge">LEVEL {userProfile.level}</div>

              <div className="level-summary" style={{ width: '100%' }}>
                <div className="level-title">LEVEL {userProfile.level}</div>
                <div className="xp-text">{userProfile.xp} / {userProfile.level * 1000} XP</div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, xpProgress)}%` }}></div>
                </div>
                <div className="xp-remaining">{(userProfile.level * 1000) - userProfile.xp} XP to Level {userProfile.level + 1}</div>
              </div>
            </div>

            {/* Real Cash */}
            <div className="profile-card balance-card">
              <div className="balance-info">
                <div className="balance-title">Real Cash</div>
                <div className="balance-amount">
                  <i className="fas fa-rupee-sign" style={{ fontSize: '1.5rem', marginRight: '5px' }}></i>
                  <span className="wallet-balance">{balance.toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/wallet?tab=deposit"
                style={{ background: 'linear-gradient(135deg, #f5b83d, #e07b00)', color: '#1a0a00', border: 'none', borderRadius: '10px', padding: '0.6rem 1rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block' }}
              >
                <i className="fas fa-plus-circle"></i> Add Cash
              </Link>
            </div>

            {/* Favorite Game */}
            <div className="profile-card">
              <div className="section-title"><i className="fas fa-heart" style={{ color: 'var(--violet)' }}></i> Favorite Game</div>
              {favGame ? (
                <div className="text-main" style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, padding: '1rem 0' }}>{favGame}</div>
              ) : (
                <div className="text-muted" style={{ textAlign: 'center', fontSize: '0.9rem', padding: '1rem 0' }}>No games played yet.</div>
              )}
            </div>

            {/* Streaks */}
            <div className="profile-card">
              <div className="section-title"><i className="fas fa-fire" style={{ color: 'var(--cyan)' }}></i> Win Streaks</div>
              <div className="flex-section" style={{ marginBottom: '0.5rem' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Current Streak</span>
                <span style={{ fontWeight: 800, color: 'var(--cyan)' }}>🔥 {streaks.current} WINS</span>
              </div>
              <div className="flex-section">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Best Streak</span>
                <span style={{ fontWeight: 800, color: 'var(--cyan)' }}>🔥 {streaks.best} WINS</span>
              </div>
            </div>
          </div>

          <div className="profile-right-col">
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-box stat-games">
                <div className="stat-val">{stats.gamesPlayed}</div>
                <div className="stat-lbl">Games</div>
              </div>
              <div className="stat-box stat-wins">
                <div className="stat-val">{stats.wins}</div>
                <div className="stat-lbl">Wins</div>
              </div>
              <div className="stat-box stat-losses">
                <div className="stat-val">{stats.losses}</div>
                <div className="stat-lbl">Losses</div>
              </div>
              <div className="stat-box stat-rate">
                <div className="stat-val">{winRate}%</div>
                <div className="stat-lbl">Win Rate</div>
              </div>
            </div>

            {/* Cash Performance */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <div className="profile-card">
                <div className="section-title"><i className="fas fa-chart-line" style={{ color: 'var(--gold)' }}></i> Cash Performance</div>
                <div className="flex-section" style={{ marginBottom: '1rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>Total Winnings</span>
                  <span style={{ fontWeight: 800, color: 'var(--green)' }}>+₹{cashEarned.toFixed(2)}</span>
                </div>
                <div className="flex-section" style={{ marginBottom: '1rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>Total Wagers</span>
                  <span style={{ fontWeight: 800, color: 'var(--red)' }}>-₹{cashSpent.toFixed(2)}</span>
                </div>
                <hr style={{ borderColor: 'rgba(255,255,255,0.05)', marginBottom: '1rem' }} />
                <div className="flex-section">
                  <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Net Profit</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: netCash >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {netCash >= 0 ? '+₹' : '-₹'}{Math.abs(netCash).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="profile-card">
              <div className="section-title"><i className="fas fa-history" style={{ color: 'var(--text-muted)' }}></i> Recent Activity</div>
              <div className="activity-list">
                {history.length === 0 && (
                  <div className="empty-state">No recent activity.</div>
                )}
                {history.slice(0, 5).map((item, i) => {
                  const icon = item.result === 'Win' ? '🏆' : item.result === 'Loss' ? '💀' : '🎁';
                  return (
                    <div key={i} className="activity-item">
                      <div className="act-left">
                        <div className="act-icon">{icon}</div>
                        <div className="act-info">
                          <div className="act-game">{item.game}</div>
                          <div className="activity-time">{item.date}</div>
                        </div>
                      </div>
                      <div className="activity-right">
                        <div className={`activity-amount ${item.result === 'Win' ? 'win' : 'loss'}`}>
                          {item.result === 'Win' ? '+' : '-'}₹{item.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Edit Profile Modal */}
          {isEditModalOpen && (
            <div className="edit-modal active">
              <div className="edit-content animate-pop-in">
                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Edit Profile</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Avatar</div>
                <div className="avatar-grid">
                  {avatars.map(a => (
                    <div
                      key={a}
                      className={`avatar-option ${selectedAvatar === a ? 'selected' : ''}`}
                      onClick={() => setSelectedAvatar(a)}
                    >
                      {a}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Username</div>
                <input
                  type="text"
                  className="edit-input"
                  placeholder="Your name"
                  maxLength="15"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <div className="btn-group">
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Modals */}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default Profile;

