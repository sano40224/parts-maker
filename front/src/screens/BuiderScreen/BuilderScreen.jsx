import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Settings, Type, MousePointer2, Plus, Code, Trash2, Palette, Layout, Scaling, Tag, Save, Sun, Box, AlignCenter, Square, ArrowUp, ArrowDown, Dices, Copy, Lock } from 'lucide-react';
// 🗑️ html2canvas のインポートを削除しました
import api from '../../api.js';
import { useAuth } from '../../context/AuthContext';
import { useModal, CustomModal } from '../../components/CustomModal';
import './BuilderScreen.css';

const getRandomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- ヘルパー関数群 ---
const getInitialStyle = (type) => {
  const base = {
    fontSize: 14, color: '#334155', display: 'block', padding: 0,
    bgType: 'solid', bgColor1: 'transparent', bgColor2: '#ffffff', bgDirection: 'to right',
    borderWidth: 0, borderColor: '#cbd5e1', radius: 0,
    shadowX: 0, shadowY: 0, shadowBlur: 0, shadowSpread: 0, shadowColor: '#94a3b8',
    enableHover: false, hover: { scale: 1, color: '#334155' }
  };
  if (type === 'button') return { ...base, width: 120, height: 40, radius: 4, bgColor1: '#2563eb', color: '#ffffff', shadowY: 4, shadowBlur: 6, shadowColor: '#cbd5e1', hover: { ...base.hover, scale: 1.05 } };
  if (type === 'input') return { ...base, width: 200, height: 40, radius: 4, borderWidth: 1, bgColor1: '#ffffff', borderColor: '#cbd5e1', padding: 10 };
  if (type === 'text') return { ...base, width: 100, height: 30, bgColor1: 'transparent', color: '#1e293b', fontSize: 16 };
  if (type === 'div') return { ...base, width: 300, height: 400, radius: 8, borderWidth: 1, borderColor: '#94a3b8', bgColor1: '#f8fafc', position: 'relative', overflow: 'hidden' };
  return base;
};

const createRandomStyle = (type) => {
    const base = getInitialStyle(type);
    const isGradient = Math.random() > 0.7;
    return {
        ...base,
        bgType: isGradient ? 'linear' : 'solid',
        bgColor1: getRandomColor(), bgColor2: getRandomColor(),
        color: getRandomColor(), borderColor: getRandomColor(),
        borderWidth: getRandomInt(0, 5), radius: getRandomInt(0, 50), fontSize: getRandomInt(12, 24),
        shadowX: getRandomInt(-10, 10), shadowY: getRandomInt(0, 20), shadowBlur: getRandomInt(0, 30), shadowSpread: getRandomInt(-5, 5), shadowColor: getRandomColor(),
        width: (type === 'div') ? getRandomInt(150, 400) : getRandomInt(100, 250),
        height: (type === 'div') ? getRandomInt(150, 400) : getRandomInt(30, 60),
    };
};

const getBackgroundCss = (s) => s.bgType === 'solid' ? s.bgColor1 : `linear-gradient(${s.bgDirection}, ${s.bgColor1}, ${s.bgColor2})`;
const getBoxShadowCss = (s) => `${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowSpread}px ${s.shadowColor}`;
const getZIndex = (type, isSelected) => {
  if (type === 'div') return 0;
  return isSelected ? 20 : 10;
};
const getGlobalPos = (el, allElements) => {
    let x = el.x; let y = el.y; let current = el;
    while (current.parentId) {
        const parent = allElements.find(p => p.id === current.parentId);
        if (!parent) break;
        x += parent.x; y += parent.y; current = parent;
    }
    return { x, y };
};

const getElementStyle = (element, isSelected, canEdit) => {
    const s = element.style;
    return {
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: s.width,
        height: s.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: getBackgroundCss(s),
        color: s.color,
        borderRadius: s.radius,
        fontSize: s.fontSize,
        border: `${s.borderWidth}px solid ${isSelected ? '#3b82f6' : s.borderColor}`,
        boxShadow: getBoxShadowCss(s),
        zIndex: getZIndex(element.type, isSelected),
        cursor: canEdit ? 'move' : 'default',
        boxSizing: 'border-box',
        overflow: element.type === 'div' ? 'hidden' : 'visible'
    };
};

export default function BuilderScreen({ onBack, initialData }) {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const { isOpen, config, closeModal, showAlert, showConfirm } = useModal();

  const currentUserId = user ? (user.id || user.UserId) : null;
  const postAuthorId = initialData ? initialData.author_id : null;
  const isOwner = !initialData || (currentUserId && postAuthorId && String(currentUserId) === String(postAuthorId));
  const [isForked, setIsForked] = useState(false);
  const [originalAuthor, setOriginalAuthor] = useState(null);
  const canEdit = isOwner || isForked;

  const [elements, setElements] = useState(() => {
    if (initialData && initialData.setting) {
      try {
        return typeof initialData.setting === 'string' ? JSON.parse(initialData.setting) : initialData.setting;
      } catch (e) { console.error(e); }
    }
    return [{
      id: 1, type: 'div', label: 'Container', customId: 'main-card', className: 'card',
      x: 50, y: 50, parentId: null, style: getInitialStyle('div')
    }];
  });

  const [postTitle, setPostTitle] = useState(initialData ? initialData.PostText : '');
  const [selectedId, setSelectedId] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editMode, setEditMode] = useState('normal');
  const [hoveringId, setHoveringId] = useState(null);

  const operationRef = useRef({ type: null, handle: null, startX: 0, startY: 0, initial: { x: 0, y: 0, w: 0, h: 0 } });

  const updateElement = (id, updater) => {
    if (!canEdit) return;
    setElements(prev => prev.map(el => el.id === id ? updater(el) : el));
  };

  const updateStyle = (key, value) => {
    if (!canEdit) return;
    updateElement(selectedId, el => {
      const newStyle = { ...el.style };
      if (editMode === 'normal') newStyle[key] = value;
      else newStyle.hover = { ...newStyle.hover, [key]: value };
      return { ...el, style: newStyle };
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!operationRef.current.type || !selectedId) return;
    const { type, handle, startX, startY, initial } = operationRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    updateElement(selectedId, el => {
      let { x, y, w, h } = initial;
      const newStyle = { ...el.style };

      if (type === 'move') {
        let newX = x + deltaX;
        let newY = y + deltaY;
        const currentEl = elements.find(item => item.id === selectedId);
        const parentEl = currentEl && currentEl.parentId ? elements.find(item => item.id === currentEl.parentId) : null;
        if (parentEl) {
            const parentW = parseInt(parentEl.style.width) || 0;
            const parentH = parseInt(parentEl.style.height) || 0;
            const selfW = parseInt(el.style.width) || 0;
            const selfH = parseInt(el.style.height) || 0;
            newX = Math.max(0, Math.min(newX, parentW - selfW));
            newY = Math.max(0, Math.min(newY, parentH - selfH));
        }
        x = newX; y = newY;
      } else if (type === 'resize') {
        if (handle.includes('e')) w += deltaX;
        if (handle.includes('s')) h += deltaY;
        if (!el.parentId) {
            if (handle.includes('w')) { w -= deltaX; x += deltaX; }
            if (handle.includes('n')) { h -= deltaY; y += deltaY; }
        } else {
            if (handle.includes('w')) { w -= deltaX; x += deltaX; }
            if (handle.includes('n')) { h -= deltaY; y += deltaY; }
        }
        newStyle.width = Math.max(20, w);
        newStyle.height = Math.max(20, h);
      }
      return { ...el, x, y, style: newStyle };
    });
  }, [selectedId, elements]);

  const handleMouseUp = useCallback(() => {
    if (operationRef.current.type === 'move' && selectedId && canEdit) {
        setElements(prevElements => {
            const movingEl = prevElements.find(e => e.id === selectedId);
            if (!movingEl) return prevElements;
            const globalPos = getGlobalPos(movingEl, prevElements);
            const globalRect = { x: globalPos.x, y: globalPos.y, w: movingEl.style.width, h: movingEl.style.height };
            let newParentId = null;
            let newLocalX = globalPos.x;
            let newLocalY = globalPos.y;
            const potentialParents = prevElements.filter(el => el.type === 'div' && el.id !== movingEl.id && el.parentId !== movingEl.id);
            for (let i = potentialParents.length - 1; i >= 0; i--) {
                const parent = potentialParents[i];
                const parentGlobal = getGlobalPos(parent, prevElements);
                if (globalRect.x >= parentGlobal.x && globalRect.y >= parentGlobal.y && globalRect.x < parentGlobal.x + parent.style.width && globalRect.y < parentGlobal.y + parent.style.height) {
                    newParentId = parent.id;
                    newLocalX = globalRect.x - parentGlobal.x;
                    newLocalY = globalRect.y - parentGlobal.y;
                    break;
                }
            }
            return prevElements.map(el => {
                if (el.id === movingEl.id) return { ...el, parentId: newParentId, x: newLocalX, y: newLocalY };
                return el;
            });
        });
    }
    operationRef.current.type = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [selectedId, handleMouseMove, canEdit]);

  const handleMouseDown = (e, id, handleType = null) => {
    e.stopPropagation();
    setSelectedId(id);
    if (!canEdit) return;
    const el = elements.find(item => item.id === id);
    if (!el) return;
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
    if (!canEdit) return;
    const newId = Date.now();
    let label = 'LABEL';
    if (type === 'div') label = 'Container';
    if (type === 'text') label = 'Text Block';
    setElements([...elements, {
        id: newId, type, label, customId: '', className: '', parentId: null,
        x: 50 + elements.length * 10, y: 50 + elements.length * 10,
        style: getInitialStyle(type)
    }]);
    setSelectedId(newId);
    setEditMode('normal');
  };

  const addRandomElement = () => {
    if (!canEdit) return;
    const newId = Date.now();
    const types = ['div', 'button', 'input', 'text'];
    const type = types[Math.floor(Math.random() * types.length)];
    let label = 'RANDOM';
    if (type === 'div') label = 'Random Box';
    if (type === 'text') label = 'Random Text';
    if (type === 'button') label = 'Click Me!';
    setElements([...elements, {
        id: newId, type, label, customId: '', className: '', parentId: null,
        x: 50 + elements.length * 10, y: 50 + elements.length * 10,
        style: createRandomStyle(type)
    }]);
    setSelectedId(newId);
    setEditMode('normal');
  };

  const deleteElement = () => {
    if (!canEdit) return;
    const idsToDelete = [selectedId];
    const findChildren = (pid) => {
        elements.forEach(el => {
            if (el.parentId === pid) { idsToDelete.push(el.id); findChildren(el.id); }
        });
    };
    findChildren(selectedId);
    setElements(elements.filter(el => !idsToDelete.includes(el.id)));
    setSelectedId(null);
  };

  const handleFork = () => {
    showConfirm('FORK PROJECT', 'このパーツをフォーク（複製）して編集しますか？', () => {
        setIsForked(true);
        setPostTitle(prev => `Fork of ${prev}`);
        if (initialData && initialData.author) { setOriginalAuthor(initialData.author); }
        showAlert('SUCCESS', 'フォークしました。編集を開始できます。', 'success');
    });
  };

  const generateSource = () => {
    const css = elements.map(el => {
      const s = el.style;
      const selector = el.className ? `.${el.className}` : `.el-${el.id}`;
      let positionStyle = el.parentId ? `position: absolute; top: ${el.y}px; left: ${el.x}px;` : `/* Root */ position: relative;`;
      const overflowStyle = el.type === 'div' ? 'overflow: hidden;' : '';
      return `
${selector} {
  ${positionStyle}
  ${overflowStyle}
  width: ${typeof s.width === 'number' ? s.width + 'px' : s.width};
  height: ${typeof s.height === 'number' ? s.height + 'px' : s.height};
  display: flex; align-items: center; justify-content: center;
  background: ${getBackgroundCss(s)};
  color: ${s.color}; border-radius: ${s.radius}px; font-size: ${s.fontSize}px;
  border: ${s.borderWidth}px solid ${s.borderColor}; box-shadow: ${getBoxShadowCss(s)};
  cursor: ${el.type === 'button' ? 'pointer' : 'default'}; box-sizing: border-box; 
}`;
    }).join('\n');

    const renderHtmlRecursive = (parentId) => {
      const children = elements.filter(el => el.parentId === parentId);
      children.sort((a, b) => { if (Math.abs(a.y - b.y) > 5) return a.y - b.y; return a.x - b.x; });
      return children.map(el => {
          const Tag = el.type === 'input' ? 'input' : (el.type === 'div' ? 'div' : (el.type === 'text' ? 'span' : 'button'));
          const idAttr = el.customId ? ` id="${el.customId}"` : '';
          const classAttr = ` class="${el.className || `el-${el.id}`}"`;
          const childrenHtml = renderHtmlRecursive(el.id);
          if (el.type === 'input') return `  <${Tag}${idAttr}${classAttr} placeholder="${el.label}" />`;
          let content = el.type === 'div' ? childrenHtml : (childrenHtml || el.label);
          return `  <${Tag}${idAttr}${classAttr}>\n    ${content}\n  </${Tag}>`;
        }).join('\n');
    };
    return { css, html: `<div class="blueprint-root">\n${renderHtmlRecursive(null)}\n</div>` };
  };

  // --- 🗑️ 修正済: 画像生成処理を削除してシンプルに保存 ---
  const handleSave = async () => {
    if (!canEdit) return;
    if (!postTitle) {
        showAlert('MISSING TITLE', 'タイトルを入力してください', 'error');
        return;
    }

    const { css, html } = generateSource();

    try {
      const currentUserId = user ? (user.id || user.UserId) : null;
      const postAuthorId = initialData ? initialData.author_id : null;
      const isMyPost = initialData && currentUserId && postAuthorId && String(currentUserId) === String(postAuthorId);
      const isUpdate = isMyPost && !isForked;

      const payload = {
        title: postTitle,
        html_code: html,
        css_code: css,
        setting: elements,
        original_author: isForked ? originalAuthor : null,
        thumbnail: null // 画像は保存しない（CSS描画に任せる）
      };

      let message = '';
      if (isUpdate) {
        await api.put(`/posts/${initialData.PostId}`, payload);
        message = '変更を保存しました（上書き）';
      } else {
        await api.post('/posts/', payload);
        message = '新しい投稿として保存しました！';
      }

      setShowSaveModal(false);
      showAlert('SAVED', message, 'success');

      setTimeout(() => {
        if (onBack) onBack();
      }, 1500);

    } catch (err) {
        console.error(err);
        showAlert('SAVE FAILED', '保存に失敗しました: ' + err.message, 'error');
    }
  };

  const RenderElement = ({ element }) => {
    const isSelected = selectedId === element.id;
    // 共通関数を使ってスタイルを取得
    const style = getElementStyle(element, isSelected, canEdit);
    const showHandles = isSelected && editMode === 'normal' && canEdit;

    return (
      <div
        data-id={element.id}
        className={isSelected ? 'selected-element' : ''}
        style={style}
        onMouseDown={(e) => handleMouseDown(e, element.id)}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setHoveringId(element.id)} onMouseLeave={() => setHoveringId(null)}
      >
        {element.type === 'input' ? null : (
          <>
            {elements.filter(child => child.parentId === element.id).map(child => ( <RenderElement key={child.id} element={child} /> ))}
            {element.type !== 'div' && elements.filter(c => c.parentId === element.id).length === 0 && element.label}
          </>
        )}
        {showHandles && (
          <>
            <div className="resize-handle handle-nw" onMouseDown={(e)=>handleMouseDown(e, element.id, 'nw')} />
            <div className="resize-handle handle-ne" onMouseDown={(e)=>handleMouseDown(e, element.id, 'ne')} />
            <div className="resize-handle handle-sw" onMouseDown={(e)=>handleMouseDown(e, element.id, 'sw')} />
            <div className="resize-handle handle-se" onMouseDown={(e)=>handleMouseDown(e, element.id, 'se')} />
          </>
        )}
      </div>
    );
  };

  const selEl = elements.find(el => el.id === selectedId);
  const currentStyle = selEl ? (editMode === 'normal' ? selEl.style : selEl.style.hover) : null;
  const { css: generatedCss, html: generatedHtml } = generateSource();

  return (
    <div className="builder-container">
      <CustomModal isOpen={isOpen} config={config} onClose={closeModal} />
      <div className="properties-panel">
        <div className="panel-header">
          <div className="panel-title"><Settings size={14} /> PROPERTIES</div>
          {selEl && <div style={{fontSize:10, color:'#64748b'}}>ID: {selEl.id}</div>}
        </div>

        {!canEdit && (
          <div style={{padding: 20, textAlign: 'center', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
            <Lock size={32} color="#94a3b8" style={{marginBottom: 8}} />
            <p style={{fontSize: 12, color: '#64748b', margin: 0}}>
              READ ONLY MODE<br/>
              Fork to edit this component.
            </p>
          </div>
        )}

        {selEl && currentStyle ? (
          <div className={`panel-scroll-area ${!canEdit ? 'disabled-panel' : ''}`}>
             <div className="property-section">
              <div className="section-label"><Tag size={10} /> Attributes</div>
              <div className="control-row">
                <label className="control-label">LABEL</label>
                <input disabled={!canEdit} type="text" value={selEl.label} onChange={(e)=>updateElement(selectedId, el=>({...el, label:e.target.value}))} className="control-input"/>
              </div>
              <div className="control-row">
                <label className="control-label">CLASS NAME</label>
                <input disabled={!canEdit} type="text" value={selEl.className} onChange={(e)=>updateElement(selectedId, el=>({...el, className:e.target.value}))} className="control-input" placeholder="optional"/>
              </div>
            </div>

            <div className="property-section">
              <div className="section-label"><Palette size={10} /> Appearance</div>
              {selEl.type !== 'text' && (
                <>
                  <div className="control-row">
                     <label className="control-label">BG TYPE</label>
                     <select disabled={!canEdit} value={currentStyle.bgType} onChange={(e)=>updateStyle('bgType', e.target.value)} className="control-select">
                        <option value="solid">Solid</option>
                        <option value="linear">Gradient</option>
                     </select>
                  </div>
                  {currentStyle.bgType === 'solid' ? (
                    <div className="control-row">
                       <label className="control-label">BG COLOR</label>
                       <div className="color-picker-wrapper">
                          <input disabled={!canEdit} type="color" value={currentStyle.bgColor1} onChange={(e)=>updateStyle('bgColor1', e.target.value)} className="color-input"/>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="control-row">
                         <label className="control-label">START COLOR</label>
                         <div className="color-picker-wrapper">
                            <input disabled={!canEdit} type="color" value={currentStyle.bgColor1} onChange={(e)=>updateStyle('bgColor1', e.target.value)} className="color-input"/>
                         </div>
                      </div>
                      <div className="control-row">
                         <label className="control-label">END COLOR</label>
                         <div className="color-picker-wrapper">
                            <input disabled={!canEdit} type="color" value={currentStyle.bgColor2} onChange={(e)=>updateStyle('bgColor2', e.target.value)} className="color-input"/>
                         </div>
                      </div>
                      <div className="control-row">
                        <label className="control-label">DIRECTION</label>
                        <select disabled={!canEdit} value={currentStyle.bgDirection} onChange={(e)=>updateStyle('bgDirection', e.target.value)} className="control-select">
                          <option value="to right">→ Right</option>
                          <option value="to left">← Left</option>
                          <option value="to bottom">↓ Bottom</option>
                          <option value="to top">↑ Top</option>
                          <option value="135deg">↘ Diagonal</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="control-row">
                 <label className="control-label">TEXT COLOR</label>
                 <div className="color-picker-wrapper">
                    <input disabled={!canEdit} type="color" value={currentStyle.color} onChange={(e)=>updateStyle('color', e.target.value)} className="color-input"/>
                 </div>
              </div>
              <div className="control-row horizontal">
                  <label className="control-label">Font Size: {currentStyle.fontSize}px</label>
                  <input disabled={!canEdit} type="range" min="10" max="48" value={currentStyle.fontSize} onChange={(e)=>updateStyle('fontSize', parseInt(e.target.value))} className="range-slider"/>
              </div>
            </div>

             <div className="property-section">
              <div className="section-label"><Scaling size={10} /> Size & Border</div>
              <div className="control-row horizontal">
                 <label className="control-label">Width</label>
                 <input disabled={!canEdit} type="number" value={parseInt(currentStyle.width)} onChange={(e)=>updateStyle('width', parseInt(e.target.value))} className="control-input" style={{width:60}}/>
              </div>
              <div className="control-row horizontal">
                 <label className="control-label">Height</label>
                 <input disabled={!canEdit} type="number" value={parseInt(currentStyle.height)} onChange={(e)=>updateStyle('height', parseInt(e.target.value))} className="control-input" style={{width:60}}/>
              </div>
              <div className="control-row horizontal">
                  <label className="control-label">Radius: {currentStyle.radius}</label>
                  <input disabled={!canEdit} type="range" min="0" max="50" value={currentStyle.radius} onChange={(e)=>updateStyle('radius', parseInt(e.target.value))} className="range-slider"/>
              </div>
              <div className="control-row horizontal">
                  <label className="control-label">Border: {currentStyle.borderWidth}</label>
                  <input disabled={!canEdit} type="range" min="0" max="10" value={currentStyle.borderWidth} onChange={(e)=>updateStyle('borderWidth', parseInt(e.target.value))} className="range-slider"/>
              </div>
            </div>

            <div className="property-section">
              <div className="section-label"><Sun size={10} /> Shadow</div>
              <div className="control-row horizontal">
                 <label className="control-label">X: {currentStyle.shadowX}px</label>
                 <input disabled={!canEdit} type="range" min="-50" max="50" value={currentStyle.shadowX} onChange={(e)=>updateStyle('shadowX', parseInt(e.target.value))} className="range-slider"/>
              </div>
              <div className="control-row horizontal">
                 <label className="control-label">Y: {currentStyle.shadowY}px</label>
                 <input disabled={!canEdit} type="range" min="-50" max="50" value={currentStyle.shadowY} onChange={(e)=>updateStyle('shadowY', parseInt(e.target.value))} className="range-slider"/>
              </div>
              <div className="control-row horizontal">
                 <label className="control-label">Blur: {currentStyle.shadowBlur}px</label>
                 <input disabled={!canEdit} type="range" min="0" max="100" value={currentStyle.shadowBlur} onChange={(e)=>updateStyle('shadowBlur', parseInt(e.target.value))} className="range-slider"/>
              </div>
              <div className="control-row horizontal">
                 <label className="control-label">Spread: {currentStyle.shadowSpread}px</label>
                 <input disabled={!canEdit} type="range" min="-50" max="50" value={currentStyle.shadowSpread} onChange={(e)=>updateStyle('shadowSpread', parseInt(e.target.value))} className="range-slider"/>
              </div>
              <div className="control-row">
                 <label className="control-label">SHADOW COLOR</label>
                 <div className="color-picker-wrapper">
                    <input disabled={!canEdit} type="color" value={currentStyle.shadowColor === 'transparent' ? '#000000' : currentStyle.shadowColor} onChange={(e)=>updateStyle('shadowColor', e.target.value)} className="color-input"/>
                 </div>
              </div>
            </div>

            {canEdit && (
              <button onClick={deleteElement} className="tool-btn danger" style={{marginTop:20}}>
                <Trash2 size={14} /> DELETE
              </button>
            )}
          </div>
        ) : (
          <div style={{padding:32, textAlign:'center', color:'#94a3b8', fontSize:12}}>Select an element</div>
        )}
      </div>

      <div className="canvas-wrapper">
        <div className="toolbar">
          {canEdit ? (
            <>
              <button onClick={()=>addElement('div')} className="tool-btn"><Square size={14}/> DIV</button>
              <button onClick={()=>addElement('text')} className="tool-btn"><Type size={14}/> TEXT</button>
              <div className="toolbar-separator" />
              <button onClick={()=>addElement('button')} className="tool-btn"><Plus size={14}/> BTN</button>
              <button onClick={()=>addElement('input')} className="tool-btn"><Plus size={14}/> INP</button>
              <div className="toolbar-separator" />
              <button onClick={addRandomElement} className="tool-btn" style={{color:'#8b5cf6'}}><Dices size={14}/> RNG</button>
            </>
          ) : (
            <div style={{color: '#64748b', fontSize: 12, display:'flex', alignItems:'center', gap:6}}>
              <Lock size={12}/> View Only
            </div>
          )}

          <div style={{flex:1}}></div>

          {canEdit ? (
            <button onClick={()=>setShowSaveModal(true)} className="tool-btn primary" style={{marginRight: 8}}><Save size={14}/> SAVE</button>
          ) : (
            <button onClick={handleFork} className="tool-btn primary" style={{marginRight: 8, backgroundColor: '#8b5cf6'}}><Copy size={14}/> FORK</button>
          )}

          <button onClick={()=>setShowCode(true)} className="tool-btn"><Code size={14}/> EXPORT CODE</button>
        </div>

        <div className="canvas-area" onClick={()=>setSelectedId(null)} ref={canvasRef}>
          {elements.filter(el => !el.parentId).map(el => (
             <RenderElement key={el.id} element={el} />
          ))}
        </div>
      </div>

      {showCode && (
        <div className="code-modal-overlay" onClick={()=>setShowCode(false)}>
          <div className="code-modal" onClick={e=>e.stopPropagation()}>
            <h3 className="panel-title">GENERATED CODE</h3>
            <div className="code-area">{`/* CSS */\n${generatedCss}\n\n\n${generatedHtml}`}</div>
            <button onClick={()=>setShowCode(false)} className="tool-btn primary" style={{marginTop:10}}>CLOSE</button>
          </div>
        </div>
      )}
      {showSaveModal && (
        <div className="code-modal-overlay" onClick={()=>setShowSaveModal(false)}>
          <div className="code-modal" onClick={e=>e.stopPropagation()} style={{maxWidth: 400}}>
            <h3 className="panel-title">SAVE BLUEPRINT</h3>
            <div style={{margin: '20px 0'}}>
              <label style={{display:'block', marginBottom:8, fontSize:12}}>TITLE</label>
              <input type="text" value={postTitle} onChange={(e)=>setPostTitle(e.target.value)} className="control-input" style={{width: '100%'}} autoFocus />
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