import React from 'react';
import { Heart, Download, Code } from 'lucide-react';
import './BlueprintCard.css';

// htmlCode, cssCode を受け取るように変更
const BlueprintCard = ({ title, description, type, likes, downloads, htmlCode, cssCode }) => {

  return (
    <div className="blueprint-card">
      <div className="card-preview">
        {/* HTMLとCSSがある場合、プレビューを表示 */}
        {htmlCode && cssCode ? (
          <div className="preview-sandbox">
            {/* 1. CSSを注入（scopedではないですが、クラス名がユニークならOK） */}
            <style>{cssCode}</style>

            {/* 2. HTMLを注入 */}
            <div
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: htmlCode }}
            />
          </div>
        ) : (
          // コードがない場合はアイコンを表示（フォールバック）
          <Code size={40} className="card-icon" />
        )}
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <span className={`card-type type-${type}`}>{type}</span>
        </div>
        <p className="card-description">{description}</p>
        <div className="card-footer">
          <div className="stat-item">
            <Heart size={16} />
            <span>{likes}</span>
          </div>
          <div className="stat-item">
            <Download size={16} />
            <span>{downloads}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintCard;