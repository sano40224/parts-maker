// src/components/CustomModal.jsx
import React, { useState, useCallback } from 'react';
// ↓↓↓ Trash2 を忘れずに追加してください
import { X, CheckCircle, AlertTriangle, Info, HelpCircle, Trash2 } from 'lucide-react';
import './CustomModal.css';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    type: 'alert',
    title: '',
    message: '',
    onConfirm: null,
  });

  const closeModal = useCallback(() => setIsOpen(false), []);

  const showAlert = useCallback((title, message, type = 'alert') => {
    setConfig({ type, title, message, onConfirm: null });
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((title, message, onConfirm) => {
    setConfig({ type: 'confirm', title, message, onConfirm });
    setIsOpen(true);
  }, []);

  // ↓↓↓ ここが重要！削除用の関数を追加
  const showDeleteConfirm = useCallback((title, message, onConfirm) => {
    setConfig({ type: 'delete', title, message, onConfirm });
    setIsOpen(true);
  }, []);

  // ↓↓↓ return に showDeleteConfirm を含める
  return { isOpen, config, closeModal, showAlert, showConfirm, showDeleteConfirm };
};

export const CustomModal = ({ isOpen, config, onClose }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (config.onConfirm) config.onConfirm();
    onClose();
  };

  let Icon = Info;
  let colorClass = 'modal-info';

  if (config.type === 'success') { Icon = CheckCircle; colorClass = 'modal-success'; }
  if (config.type === 'error') { Icon = AlertTriangle; colorClass = 'modal-error'; }
  if (config.type === 'confirm') { Icon = HelpCircle; colorClass = 'modal-confirm'; }
  // ↓↓↓ 削除タイプの設定を追加
  if (config.type === 'delete') { Icon = Trash2; colorClass = 'modal-delete'; }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className={`modal-header ${colorClass}`}>
          <div className="modal-title-area">
            <Icon size={20} />
            <span>{config.title}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{whiteSpace: 'pre-wrap'}}>{config.message}</p>
        </div>

        <div className="modal-footer">
          {(config.type === 'confirm' || config.type === 'delete') && (
            <button className="modal-btn secondary" onClick={onClose}>
              CANCEL
            </button>
          )}

          <button className={`modal-btn primary ${colorClass}-btn`} onClick={handleConfirm}>
            {config.type === 'delete' ? 'DELETE' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};