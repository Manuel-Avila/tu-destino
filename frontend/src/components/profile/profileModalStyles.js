export const profileModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '92vh',
    overflowY: 'auto',
    width: '92%',
    maxWidth: '560px',
    padding: 0,
    border: 'none',
    borderRadius: '20px',
    background: 'var(--profile-panel, #ffffff)',
  },
  overlay: {
    backgroundColor: 'rgba(2, 15, 12, 0.68)',
    zIndex: 1200,
    backdropFilter: 'blur(4px)',
  },
};
