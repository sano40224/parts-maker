import React from 'react';
import { LayoutGrid, Layers, Heart, User, PenTool, LogOut } from 'lucide-react'; // LogOutを追加
import { useAuth } from '../context/AuthContext'; // AuthContextを追加
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth(); // ログアウト関数を取得

  const menuItems = [
    { id: 'home', icon: LayoutGrid },
    { id: 'parts', icon: Layers },
    { id: 'saved', icon: Heart },
    { id: 'profile', icon: User },
  ];

  const handleLogout = async () => {
    if (window.confirm('ログアウトしますか？')) {
      await logout();
    }
  };

  return (
    <div className="sidebar">
      {/* 上部：ロゴとメニュー */}
      <div className="sidebar-top">
        <div className="logo-area">
          <PenTool size={28} />
        </div>

        <div className="nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            </button>
          ))}
        </div>
      </div>

      {/* 下部：ログアウトボタン */}
      <div className="nav-footer">
        <button className="nav-btn logout-btn" onClick={handleLogout} title="ログアウト">
          <LogOut size={24} />
        </button>
      </div>
    </div>
  );
}