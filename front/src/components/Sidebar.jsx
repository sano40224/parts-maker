import React from 'react';
import { Home, User, LogOut, Heart, PlusCircle, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// 1. モーダルをインポート
import { useModal, CustomModal } from './CustomModal';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();

  // 2. モーダルのフックを使用
  const { isOpen, config, closeModal, showConfirm } = useModal();

  // --- ログアウト処理 ---
  const handleLogout = () => {
    showConfirm(
      'LOGOUT',
      'ログアウトしますか？',
      () => {
        // OKが押されたら実行
        logout();
      }
    );
  };

  return (
    <>
      {/* 3. モーダルを配置 */}
      <CustomModal isOpen={isOpen} config={config} onClose={closeModal} />

      <aside className="sidebar">
        <div className="sidebar-logo">
          <Layers size={28} color="#8b5cf6" />
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
            title="Home"
          >
            <Home size={24} />
          </button>

          <button
            className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
            title="Create New"
          >
            <PlusCircle size={24} />
          </button>

          <button
            className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
            title="Saved Blueprints"
          >
            <Heart size={24} />
          </button>



          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            title="My Profile"
          >
            <User size={24} />
          </button>
        </nav>

        <div className="sidebar-footer">
          {/* ログアウトボタン */}
          <button className="nav-item logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={24} />
          </button>
        </div>
      </aside>
    </>
  );
}