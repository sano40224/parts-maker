import React, { useState, useEffect } from 'react';
import BlueprintCard from '../components/BlueprintCard';
import api from '../api'; // API通信用
import './HomeScreen.css';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]); // 投稿データを入れる箱
  const [loading, setLoading] = useState(true); // 読み込み中かどうか

  // 画面が表示された時に一度だけ実行
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts/');
        console.log("Fetched posts:", response.data); // 確認用ログ
        setPosts(response.data);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <header className="home-header">
        <div>
          <h1 className="page-title">BLUEPRINT.LIBRARY</h1>
        </div>
        <span className="status-text">
          {loading ? 'SYSTEM: LOADING...' : 'SYSTEM: ONLINE'}
        </span>
      </header>

      <div className="grid-container">
        {posts.length === 0 && !loading ? (
          <p style={{color: '#64748b', gridColumn: '1/-1', textAlign: 'center'}}>
            NO DATA FOUND // Create your first blueprint.
          </p>
        ) : (
          posts.map(post => (
            <BlueprintCard
              key={post.PostId}
              title={post.PostText}
              description={`Created by ${post.author}`}
              type="UI Component"
              likes={post.like_count || 0}
              downloads={post.fork_count || 0}

              htmlCode={post.HtmlCode}
              cssCode={post.CssCode}
            />
          ))
        )}
      </div>
    </div>
  );
}