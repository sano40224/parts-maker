import React from 'react';
import { ChevronLeft, Upload, Save } from 'lucide-react';
import './CreateScreen.css';

export default function CreateScreen({ onBack }) {
  return (
    <div className="create-container">
      <header className="create-header">
        <button onClick={onBack} className="back-btn">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="create-title">NEW_COMPONENT_DRAFT</h2>
          <p style={{margin:0, fontSize:12, color:'var(--text-muted)'}}>SCHEMATIC ENTRY MODE</p>
        </div>
      </header>

      <div className="create-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 左側：アップロードエリア */}
          <div className="upload-area">
            <Upload size={48} style={{ marginBottom: 16 }} />
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>DROP FILE HERE</span>
            <span style={{ fontSize: 12 }}>.STL, .DXF, .JSON supported</span>
          </div>

          <div className="spec-card">
            <div className="form-group">
              <label>TECHNICAL NOTES</label>
              <textarea className="form-textarea" placeholder="// Enter details..." />
            </div>
          </div>
        </div>

        {/* 右側：入力フォーム */}
        <div className="spec-card">
          <div className="form-group">
            <label>COMPONENT NAME</label>
            <input type="text" className="form-input" placeholder="Ex: Rotor Assembly" />
          </div>

          <div className="form-group">
            <label>CATEGORY</label>
            <select className="form-input">
              <option>Mechanical</option>
              <option>Electronic</option>
              <option>Aesthetic</option>
            </select>
          </div>

          <div className="form-group">
            <label>TAGS</label>
            <input type="text" className="form-input" placeholder="#gear, #metal" />
          </div>

          <button className="login-btn" style={{ marginTop: 'auto' }}>
            <Save size={16} style={{ marginRight: 8 }} />
            PUBLISH SPEC
          </button>
        </div>
      </div>
    </div>
  );
}