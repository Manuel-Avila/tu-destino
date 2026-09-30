import { useState, useRef, useEffect } from 'react';
import Icon from '../events/EventIcons';
import './ImagePicker.css';

export default function ImagePicker({ multiple = false, initialImages = [], onChange }) {
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Initialize previews with existing URLs if any
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setPreviews(initialImages.map(url => ({ type: 'url', url, file: null })));
    }
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPreviews = files.map(file => ({
      type: 'file',
      url: URL.createObjectURL(file),
      file: file
    }));

    let updatedPreviews;
    if (multiple) {
      updatedPreviews = [...previews, ...newPreviews];
    } else {
      updatedPreviews = [newPreviews[0]];
    }

    setPreviews(updatedPreviews);
    onChange(updatedPreviews.map(p => p.file || p.url));
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove) => {
    const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);
    setPreviews(updatedPreviews);
    onChange(updatedPreviews.map(p => p.file || p.url));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Simulate file input change event
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div className="img-picker">
      <div 
        className="img-picker__dropzone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="image" size={24} />
          <p>Haz clic para subir o arrastra {multiple ? 'tus imágenes' : 'tu imagen'} aquí</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          multiple={multiple} 
          style={{ display: 'none' }} 
        />

        {previews.length > 0 && (
          <div className="img-picker__preview-grid" style={{ marginTop: '1rem', width: '100%' }}>
            {previews.map((preview, idx) => (
              <div key={preview.url} className="img-picker__preview-item" onClick={(e) => e.stopPropagation()}>
                <img src={preview.url} alt={`Preview ${idx + 1}`} />
                <button 
                  type="button" 
                  className="img-picker__remove-btn" 
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  aria-label="Eliminar imagen"
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
