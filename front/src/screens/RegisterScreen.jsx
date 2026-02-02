import React, { useState } from 'react';
import { PenTool } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './LoginScreen.css'; // CSSはログイン画面と共有

export default function RegisterScreen({ onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // 🆕 追加: メールアドレスの状態管理
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 🆕 修正: APIにemailも含めて送信
      await api.post('/auth/register', { username, email, password });

      // 2. 成功したらそのまま自動ログイン
      await login(username, password);
    } catch (err) {
      const msg = err.response?.data?.message || '登録処理に失敗しました。';
      setError(`REGISTRATION_ERROR: ${msg}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>
          <PenTool size={40} style={{ opacity: 0.8 }} />
        </div>
        <h1 className="login-title">BLUEPRINT.REGISTER</h1>
        <p className="login-subtitle">NEW_USER // CREATE_ENTRY</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">IsError: {error}</div>}

          <input
            type="text"
            placeholder="DEFINE USER_ID"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* 🆕 追加: メールアドレス入力欄 */}
          <input
            type="email"
            placeholder="LINK EMAIL_ADDRESS"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="DEFINE ACCESS_KEY"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            ESTABLISH CONNECTION
          </button>
        </form>

        <div className="login-switch-container">
          <span>EXISTING ID?</span>
          <button onClick={onSwitchToLogin} className="login-switch-btn">
            AUTHENTICATE &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
}