// app/components/Modal.js
'use client';

import ReactModal from 'react-modal';

// Styling dasar untuk modal
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '500px',
    padding: '2rem',
    borderRadius: '8px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

// Memberitahu react-modal elemen root aplikasi Anda (penting untuk aksesibilitas)
if (typeof window !== 'undefined') {
  ReactModal.setAppElement('body');
}

export default function Modal({ isOpen, onRequestClose, children }) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Example Modal"
    >
      {children}
    </ReactModal>
  );
}