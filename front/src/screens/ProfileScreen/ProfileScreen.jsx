import React, { useState, useEffect } from 'react';
import BlueprintCard from '../../components/BlueprintCard.jsx';
import api from '../../api.js';
import { Trash2 } from 'lucide-react';
// 1. モーダルをインポート
import { useModal, CustomModal } from '../../components/CustomModal.jsx';
import './Profilescreen.css';

export default function ProfileScreen({ onEditPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. モーダル用のフックを使用
  const { isOpen, config, closeModal, showDeleteConfirm, showAlert } = useModal();

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/posts/my');
      setPosts(response.data);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  // --- 修正: 削除処理 ---
  const handleDelete = (e, postId) => {
    e.stopPropagation();

    showDeleteConfirm(
      'DELETE POST',
      '本当にこの投稿を削除しますか？\nホーム画面からも非表示になります。（この操作は取り消せません）',
      async () => {
        try {
          // OKが押されたらAPIを呼ぶ
          await api.delete(`/posts/${postId}`);

          // 画面から除外
          setPosts(prev => prev.filter(p => p.PostId !== postId));

          // 削除成功のアラートを表示（オプショナル）
          showAlert('DELETED', '投稿を削除しました', 'success');
        } catch (err) {
          console.error(err);
          showAlert('ERROR', '削除に失敗しました', 'error');
        }
      }
    );
  };

  return (
    <div>
      {/* 3. モーダルコンポーネントを配置 */}
      <CustomModal isOpen={isOpen} config={config} onClose={closeModal} />

      <header className="home-header">
        <div>
          <h1 className="page-title">MY DESIGN</h1>
        </div>
      </header>

      <div className="grid-container">
        {posts.length === 0 && !loading ? (
          <p style={{color: '#64748b', gridColumn: '1/-1', textAlign: 'center'}}>
            まだ投稿がありません。
          </p>
        ) : (
          posts.map(post => (
            <div key={post.PostId} style={{position: 'relative', cursor: 'pointer'}}>

              {/* カード本体クリックで編集画面へ */}
              <div onClick={() => onEditPost(post)}>
                <BlueprintCard
                  title={post.PostText}
                  description={`Created by You`}
                  type="UI Component"
                  likes={post.like_count || 0}
                  downloads={post.fork_count || 0}
                  htmlCode={post.HtmlCode}
                  cssCode={post.CssCode}
                  isLiked={post.is_liked}
                  originalAuthor={post.original_author}
                />
              </div>

              {/* 削除ボタン */}
              <button
                onClick={(e) => handleDelete(e, post.PostId)}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e2e8f0',
                  borderRadius: '4px', padding: '6px', cursor: 'pointer', zIndex: 10,
                  color: '#ef4444', display: 'flex'
                }}
                title="削除"
              >
                <Trash2 size={16} />
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  );
}