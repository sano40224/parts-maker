import React, { useState, useRef, useCallback } from 'react';
import { Settings, Type, MousePointer2, Plus, Code, Trash2, Palette, Layout, Scaling, Tag, Save } from 'lucide-react';
import api from '../api';
import './BuilderScreen.css';

// 初期スタイル設定
const getInitialStyle = (type) => {
  return {
    width: type === 'button' ? 120 : 200,
    height: 40,
    radius: 4,
    fontSize: 14,
    borderWidth: type === 'button' ? 0 : 1,
    bgType: 'solid',
    bgColor1: type === 'button' ? '#2563eb' : '#ffffff',
    bgColor2: '#60a5fa',
    bgDirection: 'to right',
    color: type === 'button' ? '#ffffff' : '#334155',
    borderColor: '#cbd5e1',
    enableHover: false,
    hover: {
      scale: 1.05,
      bgType: 'solid',
      bgColor1: type === 'button' ? '#1d4ed8' : '#f1f5f9',
      bgColor2: '#3b82f6',
      color: type === 'button' ? '#ffffff' : '#1e293b',
      borderColor: '#94a3b8',
    }
  };
};

export default function BuilderScreen({ onBack }) {
  const [elements, setElements] = useState([
    {
      id: 1,
      type: 'button',
      label: 'SUBMIT',
      customId: 'submit-btn',
      className: 'btn-primary',
      x: 100,
      y: 100,
      style: getInitialStyle('button')
    }
  ]);
  const [selectedId, setSelectedId] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [editMode, setEditMode] = useState('normal');
  const [hoveringId, setHoveringId] = useState(null);

  const operationRef = useRef({
    type: null, handle: null, startX: 0, startY: 0,
    initial: { x: 0, y: 0, w: 0, h: 0 }
  });

  const updateElement = (id, updater) => {
    setElements(prev => prev.map(el => el.id === id ? updater(el) : el));
  };

  const updateStyle = (key, value) => {
    updateElement(selectedId, el => {
      const newStyle = { ...el.style };
      if (editMode === 'normal') {
        newStyle[key] = value;
      } else {
        newStyle.hover = { ...newStyle.hover, [key]: value };
      }
      return { ...el, style: newStyle };
    });
  };

  const getBackgroundCss = (styleObj) => {
    if (styleObj.bgType === 'solid') return styleObj.bgColor1;
    return `linear-gradient(${styleObj.bgDirection}, ${styleObj.bgColor1}, ${styleObj.bgColor2})`;
  };

  // --- マウス操作ハンドラ ---
  const handleMouseMove = useCallback((e) => {
    if (!operationRef.current.type || !selectedId) return;
    const { type, handle, startX, startY, initial } = operationRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    updateElement(selectedId, el => {
      let { x, y, w, h } = initial;
      const newStyle = { ...el.style };

      if (type === 'move') {
        x += deltaX;
        y += deltaY;
      } else if (type === 'resize') {
        if (handle.includes('e')) w += deltaX;
        if (handle.includes('s')) h += deltaY;
        if (handle.includes('w')) { w -= deltaX; x += deltaX; }
        if (handle.includes('n')) { h -= deltaY; y += deltaY; }
        newStyle.width = Math.max(40, w);
        newStyle.height = Math.max(20, h);
      }
      return { ...el, x, y, style: newStyle };
    });
  }, [selectedId]);

  const handleMouseUp = useCallback(() => {
    operationRef.current.type = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e, id, handleType = null) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(item => item.id === id);
    operationRef.current = {
      type: handleType ? 'resize' : 'move',
      handle: handleType,
      startX: e.clientX, startY: e.clientY,
      initial: { x: el.x, y: el.y, w: el.style.width, h: el.style.height }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const addElement = (type) => {
    const newId = Date.now();
    setElements([...elements, {
      id: newId,
      type,
      label: type === 'button' ? 'BUTTON' : 'INPUT',
      customId: '',
      className: '',
      x: 50 + elements.length * 20,
      y: 50 + elements.length * 20,
      style: getInitialStyle(type)
    }]);
    setSelectedId(newId);
    setEditMode('normal');
  };

  const deleteElement = () => {
    setElements(elements.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  // --- 修正箇所: コード生成ロジック ---
  const generateSource = () => {
    const css = elements.map(el => {
      const s = el.style;
      const hoverS = s.hover;
      // 1. position: absolute などを削除し、汎用的なスタイルのみ出力
      let baseStyle = `
.el-${el.id} {
  width: ${s.width}px; height: ${s.height}px;
  background: ${getBackgroundCss(s)};
  color: ${s.color}; border-radius: ${s.radius}px;
  font-size: ${s.fontSize}px;
  border: ${s.borderWidth}px solid ${s.borderColor};
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1);
  cursor: pointer; /* ボタンらしさを追加 */
}`;
      if (s.enableHover) {
        baseStyle += `
.el-${el.id}:hover {
  transform: scale(${hoverS.scale});
  background: ${getBackgroundCss(hoverS)};
  color: ${hoverS.color};
  border-color: ${hoverS.borderColor};
}`;
      }
      return baseStyle;
    }).join('\n');

    const html = elements.map(el => {
        const Tag = el.type === 'button' ? 'button' : 'input';

        // 2. 属性の組み立て (className -> class)
        const idAttr = el.customId ? ` id="${el.customId}"` : '';
        const classAttr = ` class="el-${el.id}${el.className ? ' ' + el.className : ''}"`;

        // 3. 文字表示の修正
        if (el.type === 'button') {
            // buttonタグは中身(children)にテキストを入れる
            return `<${Tag}${idAttr}${classAttr}>${el.label}</${Tag}>`;
        } else {
            // inputタグは中身を持てないので placeholder や value 属性を使う
            return `<${Tag}${idAttr}${classAttr} placeholder="${el.label}" />`;
        }
      }).join('\n');

    return { css, html };
  };

  const handleSave = async () => {
    if (!postTitle) return alert('タイトルを入力してください');

    const { css, html } = generateSource();

    try {
      await api.post('/posts/', {
        title: postTitle,
        html_code: html,
        css_code: css,
        setting: elements
      });
      alert('保存しました！');
      setShowSaveModal(false);
      if (onBack) onBack();
    } catch (err) {
      console.error(err);
      alert('保存に失敗しました');
    }
  };

  const selEl = elements.find(el => el.id === selectedId);
  const currentStyle = selEl ? (editMode === 'normal' ? selEl.style : selEl.style.hover) : null;
  const { css: generatedCss, html: generatedHtml } = generateSource();

  return (
    <div className="builder-container">
      {/* 左パネル (省略: 変更なし) */}
      <div className="properties-panel">
        <div className="panel-header">
          <div className="panel-title"><Settings size={14} /> PROPERTIES</div>
          <div className="mode-tabs">
            <button className={`mode-tab ${editMode==='normal'?'active':''}`} onClick={()=>setEditMode('normal')}>Normal State</button>
            <button className={`mode-tab ${editMode==='hover'?'active':''}`} onClick={()=>setEditMode('hover')}>Hover State</button>
          </div>
        </div>

        {selEl && currentStyle ? (
          <div className="panel-scroll-area">
            {/* 属性設定 */}
            {editMode === 'normal' && (
              <div className="property-section">
                <div className="section-label"><Tag size={10} /> Attributes</div>
                <div className="control-row">
                  <label className="control-label">ID</label>
                  <input
                    type="text"
                    value={selEl.customId}
                    onChange={(e)=>updateElement(selectedId, el=>({...el, customId:e.target.value}))}
                    className="control-input"
                    placeholder="element-id"
                  />
                </div>
                <div className="control-row">
                  <label className="control-label">CLASS NAME</label>
                  <input
                    type="text"
                    value={selEl.className}
                    onChange={(e)=>updateElement(selectedId, el=>({...el, className:e.target.value}))}
                    className="control-input"
                    placeholder="custom-class"
                  />
                </div>
              </div>
            )}

            {/* Hover設定 */}
            {editMode === 'hover' && !selEl.style.enableHover && (
              <div className="disabled-overlay" style={{flexDirection: 'column', gap: '8px'}}>
                <span>Hover effect is disabled.</span>
                <button className="tool-btn primary" onClick={() => updateElement(selectedId, el => ({...el, style:{...el.style, enableHover:true}}))}>Enable Now</button>
              </div>
            )}
            {editMode === 'normal' && (
              <div className="property-section" style={{paddingBottom:8, borderBottom:'1px solid #e2e8f0'}}>
                <label className="checkbox-label">
                  <input type="checkbox" checked={selEl.style.enableHover} onChange={(e) => updateElement(selectedId, el => ({...el, style:{...el.style, enableHover:e.target.checked}}))} />
                  Enable Hover Effect
                </label>
              </div>
            )}

            {/* 変形設定 */}
            {editMode === 'hover' && (
              <div className="property-section">
                <div className="section-label"><Scaling size={10} /> Transformation</div>
                <div className="control-row">
                  <label className="control-label">HOVER SCALE: {currentStyle.scale}x</label>
                  <input type="range" min="0.8" max="1.5" step="0.05" value={currentStyle.scale} onChange={(e)=>updateStyle('scale', parseFloat(e.target.value))} className="range-slider" />
                </div>
              </div>
            )}

            {/* コンテンツ設定 */}
            <div className="property-section">
              <div className="section-label"><Type size={10} /> Content</div>
              {editMode === 'normal' && (
                <div className="control-row">
                  <label className="control-label">LABEL</label>
                  <input type="text" value={selEl.label} onChange={(e)=>updateElement(selectedId, el=>({...el, label:e.target.value}))} className="control-input"/>
                </div>
              )}
               <div className="control-row">
                  <label className="control-label">TEXT COLOR</label>
                  <div className="color-picker-wrapper">
                    <input type="color" value={currentStyle.color} onChange={(e)=>updateStyle('color', e.target.value)} className="color-input"/>
                    <span className="color-value">{currentStyle.color}</span>
                  </div>
              </div>
              {editMode === 'normal' && (
                 <div className="control-row">
                  <label className="control-label">FONT SIZE: {currentStyle.fontSize}px</label>
                  <input type="range" min="10" max="48" value={currentStyle.fontSize} onChange={(e)=>updateStyle('fontSize', parseInt(e.target.value))} className="range-slider"/>
                </div>
              )}
            </div>

            {/* 背景設定 */}
             <div className="property-section">
              <div className="section-label"><Palette size={10} /> Background</div>
              <div className="control-row">
                 <label className="control-label">TYPE</label>
                 <select value={currentStyle.bgType} onChange={(e)=>updateStyle('bgType', e.target.value)} className="control-select">
                    <option value="solid">Solid Color</option>
                    <option value="linear">Linear Gradient</option>
                 </select>
              </div>
              <div className="color-picker-group">
                 <div className="control-label">{currentStyle.bgType==='linear'?'START COLOR':'COLOR'}</div>
                 <div className="color-picker-wrapper">
                    <input type="color" value={currentStyle.bgColor1} onChange={(e)=>updateStyle('bgColor1', e.target.value)} className="color-input"/>
                    <span className="color-value">{currentStyle.bgColor1}</span>
                 </div>
                 {currentStyle.bgType === 'linear' && (
                   <>
                    <div className="control-label" style={{marginTop:8}}>END COLOR</div>
                    <div className="color-picker-wrapper">
                        <input type="color" value={currentStyle.bgColor2} onChange={(e)=>updateStyle('bgColor2', e.target.value)} className="color-input"/>
                        <span className="color-value">{currentStyle.bgColor2}</span>
                    </div>
                    <div className="control-label" style={{marginTop:8}}>DIRECTION</div>
                    <select value={currentStyle.bgDirection} onChange={(e)=>updateStyle('bgDirection', e.target.value)} className="control-select">
                        <option value="to right">To Right →</option>
                        <option value="to left">To Left ←</option>
                        <option value="to bottom">To Bottom ↓</option>
                        <option value="to top">To Top ↑</option>
                        <option value="45deg">Diagonal ↘</option>
                    </select>
                   </>
                 )}
              </div>
            </div>

            {/* レイアウト設定 */}
            <div className="property-section">
              <div className="section-label"><Layout size={10} /> Layout & Border</div>
              {editMode === 'normal' && (
                <>
                  <div className="control-row horizontal">
                    <label className="control-label">WIDTH</label>
                    <input type="number" value={currentStyle.width} onChange={(e)=>updateStyle('width',parseInt(e.target.value))} className="control-input" style={{width:60}}/>
                  </div>
                  <div className="control-row horizontal">
                    <label className="control-label">HEIGHT</label>
                    <input type="number" value={currentStyle.height} onChange={(e)=>updateStyle('height',parseInt(e.target.value))} className="control-input" style={{width:60}}/>
                  </div>
                  <div className="control-row"><label className="control-label">RADIUS: {currentStyle.radius}px</label><input type="range" min="0" max="50" value={currentStyle.radius} onChange={(e)=>updateStyle('radius', parseInt(e.target.value))} className="range-slider"/></div>
                </>
              )}
               <div className="control-row"><label className="control-label">BORDER WIDTH: {currentStyle.borderWidth}px</label><input type="range" min="0" max="10" value={currentStyle.borderWidth} onChange={(e)=>updateStyle('borderWidth', parseInt(e.target.value))} className="range-slider"/></div>
               <div className="control-row">
                 <label className="control-label">BORDER COLOR</label>
                  <div className="color-picker-wrapper">
                    <input type="color" value={currentStyle.borderColor} onChange={(e)=>updateStyle('borderColor', e.target.value)} className="color-input"/>
                  </div>
               </div>
            </div>

            <button onClick={deleteElement} className="tool-btn danger" style={{marginTop:'auto', justifyContent:'center'}}>
              <Trash2 size={14} /> DELETE ELEMENT
            </button>
          </div>
        ) : (
          <div style={{padding:32, fontSize:12, color:'var(--text-muted)', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center'}}>
            <MousePointer2 style={{marginBottom:8, opacity:0.4}} size={32} />
            <p>Select an element on canvas<br/>to edit its properties.</p>
          </div>
        )}
      </div>

      {/* 右パネル */}
      <div className="canvas-wrapper">
        <div className="toolbar">
          <button onClick={()=>addElement('button')} className="tool-btn"><Plus size={14}/> BUTTON</button>
          <button onClick={()=>addElement('input')} className="tool-btn"><Plus size={14}/> INPUT</button>
          <div style={{flex:1}}></div>
          {/* 保存ボタン */}
          <button onClick={()=>setShowSaveModal(true)} className="tool-btn primary" style={{marginRight: 8}}><Save size={14}/> SAVE</button>
          <button onClick={()=>setShowCode(true)} className="tool-btn"><Code size={14}/> EXPORT CODE</button>
        </div>

        <div className="canvas-area" onClick={()=>setSelectedId(null)}>
          {elements.map(el => {
            const isSelected = selectedId === el.id;
            const isHovering = hoveringId === el.id;
            const isHoverActive = (editMode === 'hover' && isSelected && el.style.enableHover) || (isHovering && el.style.enableHover);
            const displayStyle = isHoverActive ? el.style.hover : el.style;
            const scale = isHoverActive ? el.style.hover.scale : 1;

            return (
              <div
                key={el.id}
                className={`canvas-element-wrapper ${isSelected ? 'selected' : ''}`}
                style={{
                  top: el.y, left: el.x, width: el.style.width, height: el.style.height,
                  zIndex: isHoverActive ? 100 : 1
                }}
                onMouseDown={(e) => handleMouseDown(e, el.id)}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoveringId(el.id)}
                onMouseLeave={() => setHoveringId(null)}
              >
                <div className="canvas-element" style={{
                  background: getBackgroundCss(displayStyle),
                  color: displayStyle.color,
                  borderRadius: el.style.radius,
                  fontSize: el.style.fontSize,
                  border: `${el.style.borderWidth}px solid ${displayStyle.borderColor}`,
                  transform: `scale(${scale})`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  // プレビュー画面ではflexで中央揃えにして、ボタンならテキストを表示
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {el.type === 'button' ? el.label : <span style={{opacity:0.5, pointerEvents:'none'}}>{el.label}</span>}
                </div>
                {isSelected && editMode === 'normal' && ['nw','n','ne','w','e','sw','s','se'].map(h => (
                  <div key={h} className={`resize-handle handle-${h}`} onMouseDown={(e)=>handleMouseDown(e, el.id, h)} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* コード表示モーダル */}
      {showCode && (
        <div className="code-modal-overlay" onClick={()=>setShowCode(false)}>
          <div className="code-modal" onClick={e=>e.stopPropagation()}>
            <h3 className="panel-title" style={{fontSize:16}}>GENERATED SOURCE CODE</h3>
            <div className="code-area">
              {`/* CSS Styles */\n${generatedCss}\n\n\n${generatedHtml}`}
            </div>
            <button onClick={()=>setShowCode(false)} className="tool-btn primary" style={{justifyContent:'center', padding:12}}>CLOSE</button>
          </div>
        </div>
      )}

      {/* 保存モーダル */}
      {showSaveModal && (
        <div className="code-modal-overlay" onClick={()=>setShowSaveModal(false)}>
          <div className="code-modal" onClick={e=>e.stopPropagation()} style={{maxWidth: 400}}>
            <h3 className="panel-title" style={{fontSize:16}}>SAVE BLUEPRINT</h3>
            <div style={{margin: '20px 0'}}>
              <label style={{display:'block', marginBottom:8, fontSize:12, color:'var(--text-muted)'}}>TITLE</label>
              <input
                type="text"
                value={postTitle}
                onChange={(e)=>setPostTitle(e.target.value)}
                className="control-input"
                style={{width: '100%', fontSize: 16, padding: 8}}
                placeholder="My Awesome Component"
                autoFocus
              />
            </div>
            <div style={{display:'flex', gap:10}}>
              <button onClick={()=>setShowSaveModal(false)} className="tool-btn" style={{flex:1, justifyContent:'center'}}>CANCEL</button>
              <button onClick={handleSave} className="tool-btn primary" style={{flex:1, justifyContent:'center'}}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}