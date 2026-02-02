import React, { useState } from 'react';
import { PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginScreen.css';

export default function LoginScreen({ onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // エラーをリセット
    try {
      await login(username, password);
      // 成功するとApp.jsx側で自動的に画面が切り替わります
    } catch (err) {
      // エラー表示。雰囲気に合わせて少しメカニカルなメッセージに
      setError('AUTH_FAILURE: IDまたはKEYが無効です。');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>
          <PenTool size={40} />
        </div>
        <h1 className="login-title">BLUEPRINT.ACCESS</h1>
        <p className="login-subtitle">SECURE_WORKSPACE // V2.0</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">IsError: {error}</div>}

          <input
            type="text" // バックエンドに合わせてemailからtextに変更
            placeholder="USER_ID or EMAIL"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="ACCESS_KEY"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">
            INITIALIZE SESSION
          </button>
        </form>

        <div className="login-switch-container">
          <span>NO ACCESS ID?</span>
          <button onClick={onSwitchToRegister} className="login-switch-btn">
            CREATE_ENTRY &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
}