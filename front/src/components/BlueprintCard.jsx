import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Heart, Download, User, GitFork } from 'lucide-react';
import './BlueprintCard.css';

export default function BlueprintCard({
  title,
  description,
  likes,
  downloads,
  htmlCode,
  cssCode,
  isLiked,
  onLikeToggle,
  originalAuthor
}) {
  const wrapperRef = useRef(null);
  const shadowHostRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isReady, setIsReady] = useState(false); // 描画準備完了フラグ

  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host) return;

    let shadow = host.shadowRoot;
    if (!shadow) {
      shadow = host.attachShadow({ mode: 'open' });
    }

    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        #content-root {
          display: table; /* これが重要！中身のサイズにフィットします */
          width: max-content;
          transform-origin: center center;
        }
        /* ユーザーのCSS */
        ${cssCode}
      </style>
      <div id="content-root">
        ${htmlCode}
      </div>
    `;

    setTimeout(() => setIsReady(true), 50);

  }, [htmlCode, cssCode]);

  useLayoutEffect(() => {
    if (!isReady) return; // 準備ができるまで何もしない

    const host = shadowHostRef.current;
    const wrapper = wrapperRef.current;

    if (host && host.shadowRoot && wrapper) {
      const rootEl = host.shadowRoot.getElementById('content-root');
      if (!rootEl) return;

      requestAnimationFrame(() => {
         const wrapperWidth = wrapper.clientWidth - 40; // 上下左右の余白分を引く
         const wrapperHeight = wrapper.clientHeight - 40;

         // 中身の正確なサイズを取得
         const rect = rootEl.getBoundingClientRect();
         const contentWidth = rect.width;
         const contentHeight = rect.height;

         if (contentWidth > 0 && contentHeight > 0) {
           const scaleX = wrapperWidth / contentWidth;
           const scaleY = wrapperHeight / contentHeight;

           // 縦横どちらか小さい方の倍率に合わせる（1倍以上には拡大しない）
           const newScale = Math.min(scaleX, scaleY, 1);
           setScale(newScale);
         } else {
           setScale(1); // 計測失敗時は等倍
         }
      });
    }
  }, [isReady, htmlCode, cssCode]); // isReadyがtrueになったら実行

  return (
    <div className="blueprint-card">
      {/* プレビューエリア */}
      <div className="card-preview-area" ref={wrapperRef}>
        {/* Shadow DOM ホスト */}
        <div
          ref={shadowHostRef}
          style={{
            // ホスト自体を縮小する
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // プレビュー内の操作を無効化
            opacity: isReady ? 1 : 0, // 計算が終わるまで隠しておく（ガタつき防止）
            transition: 'opacity 0.2s ease-in'
          }}
        />
        {/* クリック妨害レイヤー */}
        <div className="card-overlay" />
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <span className="card-badge">UI Component</span>
        </div>

        {originalAuthor && (
          <div className="fork-info">
            <GitFork size={12} />
            <span>Forked from {originalAuthor}</span>
          </div>
        )}

        <div className="card-footer">
          <div className="author-info">
            <User size={14} />
            <span>{description}</span>
          </div>
          <div className="card-stats">
            <button
              className={`stat-btn ${isLiked ? 'liked' : ''}`}
              onClick={(e) => { e.stopPropagation(); onLikeToggle(); }}
            >
              <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
              <span>{likes}</span>
            </button>
            <div className="stat-item">
              <Download size={14} />
              <span>{downloads}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}