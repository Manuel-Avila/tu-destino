import { useState } from 'react';
import Icon from './events/EventIcons';
import './ImageCarousel.css';

/**
 * Carrusel de imágenes (flechas, puntos y contador). Con una sola imagen
 * se comporta como una foto normal, sin controles.
 */
export default function ImageCarousel({ images = [], title = '' }) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  if (total === 0) return null;

  const go = (delta) => setIndex((i) => (i + delta + total) % total);

  return (
    <div
      className="img-carousel"
      role="group"
      aria-roledescription="carrusel"
      aria-label={`Fotos de ${title}`}
      tabIndex={total > 1 ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
    >
      <img src={images[index]} alt={`${title} (foto ${index + 1} de ${total})`} />

      {total > 1 && (
        <>
          <button type="button" className="img-carousel__nav img-carousel__nav--prev" onClick={() => go(-1)} aria-label="Foto anterior">
            <Icon name="chevron-left" size={18} />
          </button>
          <button type="button" className="img-carousel__nav img-carousel__nav--next" onClick={() => go(1)} aria-label="Foto siguiente">
            <Icon name="chevron-right" size={18} />
          </button>

          <span className="img-carousel__count" aria-hidden="true">{index + 1} / {total}</span>

          <div className="img-carousel__dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={i === index ? 'is-active' : ''}
                onClick={() => setIndex(i)}
                aria-label={`Ir a la foto ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
