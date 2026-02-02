import React, { useState, useEffect } from 'react';
import BlueprintCard from '../../components/BlueprintCard.jsx';
import api from '../../api.js';
import './HomeScreen.css';

export default function HomeScreen({ onEditPost, filterMode = 'all' }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const endpoint = filterMode === 'liked' ? '/posts/liked' : '/posts/';
      // キャッシュ対策: URLに時間を付与して、常に最新データを取得する
      const response = await api.get(`${endpoint}?t=${new Date().getTime()}`);
      setPosts(response.data);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterMode]);

  const handleToggleLike = async (post) => {
    try {
      const res = await api.post(`/posts/${post.PostId}/like`);
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.PostId === post.PostId) {
          return { ...p, is_liked: !p.is_liked, like_count: res.data.like_count };
        }
        return p;
      }));
      if (filterMode === 'liked') {
        setPosts(prev => prev.filter(p => p.PostId !== post.PostId));
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  return (
    <div>
      <header className="home-header">
        <div>
          <h1 className="page-title">
            {filterMode === 'liked' ? 'LIKE LIST' : 'PARTS-MAKER'}
          </h1>
        </div>
      </header>

      <div className="grid-container">
        {posts.length === 0 && !loading ? (
          <p style={{color: '#64748b', gridColumn: '1/-1', textAlign: 'center'}}>
            {filterMode === 'liked' ? 'いいねした投稿はありません。' : '投稿がありません。'}
          </p>
        ) : (
          posts.map(post => (
            <div key={post.PostId} onClick={() => onEditPost(post)} style={{cursor: 'pointer'}}>
              <BlueprintCard
                // 基本情報
                title={post.PostText}
                // Home画面では作成者名を表示
                description={`Created by ${post.User ? post.User.UserName : (post.author || 'Unknown')}`}
                type="UI Component"
                likes={post.like_count || 0}
                downloads={post.fork_count || 0}
                isLiked={post.is_liked}

                // 🟢【ここを修正しました！】
                // ProfileScreenと同じように htmlCode と cssCode を渡します
                // setting={post.setting} は削除しました
                htmlCode={post.HtmlCode}
                cssCode={post.CssCode}

                originalAuthor={post.original_author}
                onLikeToggle={() => handleToggleLike(post)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}