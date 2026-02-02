import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext'; // 作成したContextをインポート
import Sidebar from './components/Sidebar';
import HomeScreen from './screens/HomeScreen';
import CreateScreen from './screens/CreateScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen'; // 新規追加が必要
import BuilderScreen from './screens/BuilderScreen';
import './App.css';

// 実際の表示ロジックを行うコンポーネント
const AppContent = () => {
  const { user, loading } = useAuth(); // AuthContextからログイン情報とロード状態を取得
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isRegisterMode, setIsRegisterMode] = useState(false); // ログイン画面と登録画面の切り替え用

  // 1. セッション確認中（ロード中）は何も表示しないか、ローディング画面を出す
  if (loading) {
    return <div className="loading-screen">読み込み中...</div>;
  }

  // 2. ログインしていない場合（userがnull）
  if (!user) {
    // 登録モードなら登録画面、そうでなければログイン画面を表示
    if (isRegisterMode) {
      return <RegisterScreen onSwitchToLogin={() => setIsRegisterMode(false)} />;
    }
    return <LoginScreen onSwitchToRegister={() => setIsRegisterMode(true)} />;
  }

  // 3. ログインしている場合（メインアプリを表示）
  return (
    <div className="app-container">
      <Sidebar activeTab={currentScreen} setActiveTab={setCurrentScreen} />

      <main className="main-content">
        {currentScreen === 'home' && <HomeScreen />}
        {currentScreen === 'create' && <CreateScreen onBack={() => setCurrentScreen('home')} />}
        {currentScreen === 'parts' && (
          <BuilderScreen onBack={() => setCurrentScreen('home')} />
        )}
        {currentScreen === 'saved' && <div>Saved Screen (Under Construction)</div>}
        {currentScreen === 'profile' && <div>Profile Screen (Under Construction)</div>}
      </main>
    </div>
  );
};

// 外枠のAppコンポーネント
function App() {
  return (
    // AuthProviderでアプリ全体を包むことで、どこでもログイン情報を使えるようにする
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;