import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("現在のAPI接続先:", api.defaults.baseURL);

  // 初回ロード時にログイン状態を確認
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.is_authenticated) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.log("未ログイン");
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    setUser(res.data.user);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // コンソールで確認（デバッグ用）
  console.log("現在のAPI接続先:", api.defaults.baseURL);

  // 初回ロード時にログイン状態を確認
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.is_authenticated) {
          setUser(res.data.user);
        }
      } catch (err) {
        // 未ログインは正常な状態なので、エラーログは出さなくてOK
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    setUser(res.data.user);
    // 必要であれば戻り値を返す
    return res.data;
  };

  // ▼ 追加: Register（新規登録）機能
  const register = async (username, password, email) => {
    // Flask側の受け取り形式に合わせて引数を送信
    const res = await api.post('/auth/register', { username, password, email });
    // 登録後に自動ログインさせる場合はここで setUser するなどの処理が必要ですが、
    // まずは登録処理だけを通します。
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    // ▼ value に register を追加するのを忘れずに！
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);