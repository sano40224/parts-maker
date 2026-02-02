import React from 'react';
import { Share2, Settings, Box } from 'lucide-react';
import BlueprintCard from '../components/BlueprintCard.jsx'; // カードコンポーネントを再利用
import './ProfileScreen.css';

// モックデータ (App.jsxからpropsで渡すか、ここで定義)
const CURRENT_USER = {
  id: 'u1',
  name: 'NetRunner_01',
  handle: '@runner_01',
  avatarColor: 'bg-cyan-600', // CSSで色を制御
  bio: 'Full-stack cyberdeck builder. Specializing in high-latency neural networks.',
  stats: { reputation: 8942, uploads: 42, forks: 156 }
};

const MOCK_USER_POSTS = [
  {
    id: 'p1',
    user: CURRENT_USER,
    title: 'High-Torque Planetary Gear v2',
    description: '強化樹脂プリント用の高トルクギアセット。',
    tags: ['#3DPrint', '#Gear'],
    likes: 124,
    downloads: 342,
    type: 'mechanical',
    isLiked: false
  },
   {
    id: 'p2',
    user: CURRENT_USER,
    title: 'Void Keycap "Abyss"',
    description: '深淵を覗くようなレジンキャップ。',
    tags: ['#Art'],
    likes: 89,
    downloads: 120,
    type: 'aesthetic',
    isLiked: false
  },
];

const ProfileScreen = () => {
  return (
    <div className="profile-screen fade-in">
       {/* Banner Area */}
       <div className="profile-banner">
          <div className="banner-overlay"></div>
          <div className="banner-actions">
             <button className="icon-btn"><Share2 size={16} /></button>
             <button className="icon-btn"><Settings size={16} /></button>
          </div>
       </div>

       {/* User Info Overlay */}
       <div className="profile-info-container">
          <div className="avatar-section">
             <div className="profile-avatar-wrapper">
                <div className={`profile-avatar ${CURRENT_USER.avatarColor}`}></div>
             </div>
             <div className="status-badge">ONLINE</div>
          </div>

          <div className="user-text">
             <h1 className="user-fullname">
                {CURRENT_USER.name}
                <span className="user-handle">{CURRENT_USER.handle}</span>
             </h1>
             <p className="user-bio">
                {CURRENT_USER.bio}
             </p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
             <div className="stat-box">
                <div className="stat-label">Rep</div>
                <div className="stat-value cyan">{CURRENT_USER.stats.reputation}</div>
             </div>
             <div className="stat-box border-left">
                <div className="stat-label">Uploads</div>
                <div className="stat-value white">{CURRENT_USER.stats.uploads}</div>
             </div>
             <div className="stat-box border-left">
                <div className="stat-label">Forks</div>
                <div className="stat-value pink">{CURRENT_USER.stats.forks}</div>
             </div>
          </div>
       </div>

       {/* Content Tabs */}
       <div className="content-area">
          <div className="tabs-header">
             {['INVENTORY', 'SAVED_NODES', 'ACTIVITY_LOG'].map((tab, i) => (
                <button key={tab} className={`tab-btn ${i === 0 ? 'active' : ''}`}>
                   {tab}
                </button>
             ))}
          </div>

          <div className="profile-grid">
             {MOCK_USER_POSTS.map(post => (
                 <BlueprintCard key={post.id} post={post} onLike={() => {}} />
             ))}

             {/* Empty State Example */}
             <div className="empty-state">
                <Box size={32} className="empty-icon" />
                <span>NO_DATA_FOUND</span>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ProfileScreen;