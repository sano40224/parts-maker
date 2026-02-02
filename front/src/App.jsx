// src/App.jsx

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomeScreen from './screens/HomeScreen/HomeScreen.jsx';
import BuilderScreen from './screens/BuiderScreen/BuilderScreen.jsx';
import RegisterScreen from './screens/RegisterScreen/RegisterScreen.jsx';
import LoginScreen from './screens/LoginScreen/LoginScreen.jsx';
import ProfileScreen from './screens/ProfileScreen/ProfileScreen.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// 認証が必要な画面のラッパー
const AuthenticatedApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [editingPost, setEditingPost] = useState(null);

  const handleEditPost = (post) => {
    setEditingPost(post);
    setActiveTab('create');
  };

  const handleBackToHome = () => {
    setEditingPost(null);
    setActiveTab('home');
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">

        {/* ホーム画面（通常） */}
        {activeTab === 'home' && (
          <HomeScreen onEditPost={handleEditPost} filterMode="all" />
        )}

        {/* 🆕 いいね一覧画面 (HomeScreenを再利用！) */}
        {activeTab === 'saved' && (
          <HomeScreen onEditPost={handleEditPost} filterMode="liked" />
        )}

        {/* 作成画面 */}
        {(activeTab === 'create' || activeTab === 'parts') && (
          <BuilderScreen onBack={handleBackToHome} initialData={editingPost} />
        )}

        {/* 🆕 プロフィール画面 */}
        {activeTab === 'profile' && (
           <ProfileScreen onEditPost={handleEditPost} />
        )}

      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

// ログイン状態によって出し分け
function MainContent() {
  const { user, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  if (loading) return <div className="loading">LOADING SYSTEM...</div>;

  if (!user) {
    return isRegistering ? (
      <RegisterScreen onSwitchToLogin={() => setIsRegistering(false)} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setIsRegistering(true)} />
    );
  }

  return <AuthenticatedApp />;
}