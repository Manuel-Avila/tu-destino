import { useCallback, useEffect, useRef, useState } from 'react';
import { SPOT_BACK, SPOT_NEXT } from '../../data/immersion';
import './immersion.css';

// A-Frame se carga una sola vez desde /public/vendor (sin depender de internet).
let aframePromise = null;
function loadAFrame() {
  if (window.AFRAME) return Promise.resolve(window.AFRAME);
  if (!aframePromise) {
    aframePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${import.meta.env.BASE_URL}vendor/aframe.min.js`;
      script.async = true;
      script.onload = () => {
        registerComponents(window.AFRAME);
        resolve(window.AFRAME);
      };
      script.onerror = () => {
        aframePromise = null;
        reject(new Error('No se pudo cargar A-Frame'));
      };
      document.head.appendChild(script);
    });
  }
  return aframePromise;
}

function registerComponents(AFRAME) {
  if (AFRAME.components['face-camera']) return;

  // Las flechas siempre miran hacia la cámara (que está fija en el centro de la esfera).
  AFRAME.registerComponent('face-camera', {
    init() {
      this.target = new AFRAME.THREE.Vector3();
    },
    tick() {
      const cam = this.el.sceneEl.camera;
      if (!cam) return;
      cam.getWorldPosition(this.target);
      this.el.object3D.lookAt(this.target);
    },
  });

  // Flecha de traslado: <a-image class="adelante" spot="linkto: c2" position="x y z">
  AFRAME.registerComponent('spot', {
    schema: {
      linkto: { type: 'string' },
      size: { type: 'number', default: 1.4 },
    },
    init() {
      const el = this.el;
      const { linkto, size } = this.data;
      const back = el.classList.contains('atras');

      el.setAttribute('geometry', 'width', size);
      el.setAttribute('geometry', 'height', size);
      el.setAttribute('material', 'src', back ? '#spot-back' : '#spot-next');
      el.setAttribute('material', 'shader', 'flat');
      el.setAttribute('material', 'transparent', true);
      el.setAttribute('face-camera', '');

      el.addEventListener('click', () => el.sceneEl.emit('spot-go', { to: linkto }));
      el.addEventListener('mouseenter', () => {
        el.setAttribute('scale', '1.18 1.18 1.18');
        if (el.sceneEl.canvas) el.sceneEl.canvas.style.cursor = 'pointer';
      });
      el.addEventListener('mouseleave', () => {
        el.setAttribute('scale', '1 1 1');
        if (el.sceneEl.canvas) el.sceneEl.canvas.style.cursor = '';
      });
    },
  });
}

function buildSceneHTML(scenes) {
  const imgs = scenes
    .map((s) => `<img id="pano-${s.id}" src="${s.src}" alt="" crossorigin="anonymous">`)
    .join('');

  // Un grupo por escena (como group-pointN en bcsxplora); solo el actual tiene scale 1.
  const groups = scenes
    .map((s, i) => `<a-entity id="group-${s.id}" scale="${i === 0 ? '1 1 1' : '0 0 0'}">${s.html}</a-entity>`)
    .join('');

  return `
    <a-scene embedded vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"
      loading-screen="enabled: false" renderer="antialias: true" background="color: #0b2b2a">
      <a-assets timeout="60000">
        ${imgs}
        <img id="spot-next" src="${SPOT_NEXT}" alt="">
        <img id="spot-back" src="${SPOT_BACK}" alt="">
      </a-assets>
      <a-sky id="sky" src="#pano-${scenes[0].id}" rotation="0 -90 0"></a-sky>
      ${groups}
      <a-entity id="cam" camera="fov: 80" position="0 0 0"
        look-controls="magicWindowTrackingEnabled: false; reverseMouseDrag: false"></a-entity>
      <a-entity cursor="rayOrigin: mouse; fuse: false" raycaster="objects: .adelante, .atras; far: 100"></a-entity>
    </a-scene>`;
}

export default function PanoramaViewer({ place }) {
  const { scenes } = place;
  const stageRef = useRef(null);
  const holderRef = useRef(null);
  const sceneRef = useRef(null);
  const indexRef = useRef(0);
  const busyRef = useRef(false);
  const goRef = useRef(() => {});
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [fading, setFading] = useState(false);
  const [expanded, setExpanded] = useState(false); // pantalla completa "simulada" (iPhone/Safari)

  // A-Frame solo reajusta el canvas cuando la ventana dispara "resize".
  const resizeScene = useCallback(() => {
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
  }, []);

  // En vertical (celular) el campo de visión se abre para ver más de la imagen.
  const updateFov = useCallback(() => {
    const holder = holderRef.current;
    const cam = sceneRef.current?.querySelector('#cam');
    if (!holder || !cam) return;
    const { width, height } = holder.getBoundingClientRect();
    if (!width || !height) return;
    cam.setAttribute('camera', 'fov', width / height < 1 ? 100 : 80);
  }, []);

  const applyScene = useCallback(
    (i) => {
      const sceneEl = sceneRef.current;
      if (!sceneEl) return;
      const scene = scenes[i];

      sceneEl.querySelector('#sky').setAttribute('src', `#pano-${scene.id}`);
      scenes.forEach((s) => {
        sceneEl
          .querySelector(`#group-${s.id}`)
          .setAttribute('scale', s.id === scene.id ? '1 1 1' : '0 0 0');
      });

      // Al llegar mira hacia la flecha "adelante" (o el startAz de la escena si lo defines).
      const fwd = sceneEl.querySelector(`#group-${scene.id} .adelante`)?.getAttribute('position');
      const startAz = scene.startAz ?? (fwd ? (Math.atan2(fwd.x, -fwd.z) * 180) / Math.PI : 0);
      const look = sceneEl.querySelector('#cam').components['look-controls'];
      if (look) {
        look.yawObject.rotation.y = (-startAz * Math.PI) / 180;
        look.pitchObject.rotation.x = 0;
      }
      indexRef.current = i;
    },
    [scenes],
  );

  const goTo = useCallback(
    (i) => {
      if (busyRef.current || i === indexRef.current || i < 0 || i >= scenes.length) return;
      busyRef.current = true;
      setFading(true);
      window.setTimeout(() => {
        applyScene(i);
        setIndex(i);
        setFading(false);
        busyRef.current = false;
      }, 280);
    },
    [applyScene, scenes.length],
  );

  useEffect(() => {
    goRef.current = goTo;
  }, [goTo]);

  useEffect(() => {
    let cancelled = false;
    const holder = holderRef.current;
    setStatus('loading');
    indexRef.current = 0;
    setIndex(0);

    loadAFrame()
      .then(() => {
        if (cancelled) return;
        holder.innerHTML = buildSceneHTML(scenes);
        const sceneEl = holder.querySelector('a-scene');
        sceneRef.current = sceneEl;
        sceneEl.addEventListener('spot-go', (e) => {
          goRef.current(scenes.findIndex((x) => x.id === e.detail.to));
        });
        const onLoaded = () => {
          if (cancelled) return;
          applyScene(0);
          updateFov();
          setStatus('ready');
        };
        if (sceneEl.hasLoaded) onLoaded();
        else sceneEl.addEventListener('loaded', onLoaded, { once: true });
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      sceneRef.current = null;
      holder.innerHTML = '';
    };
  }, [scenes, applyScene, updateFov]);

  // Si cambia el tamaño del contenedor (girar el celular, pantalla completa) se reajusta el visor.
  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => updateFov());
    observer.observe(holder);
    return () => observer.disconnect();
  }, [updateFov]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', resizeScene);
    return () => document.removeEventListener('fullscreenchange', resizeScene);
  }, [resizeScene]);

  useEffect(() => {
    resizeScene();
    if (!expanded) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [expanded, resizeScene]);

  const toggleFullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (expanded) {
      setExpanded(false);
    } else if (document.fullscreenEnabled && el.requestFullscreen) {
      el.requestFullscreen().catch(() => setExpanded(true));
    } else {
      setExpanded(true); // iPhone: no hay fullscreen nativo para elementos
    }
  };

  const isTouch = typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches;

  return (
    <div className={`pano-stage ${expanded ? 'is-expanded' : ''}`.trim()} ref={stageRef}>
      <div className="pano-stage__scene" ref={holderRef} />

      <div className={`pano-fade ${fading ? 'is-on' : ''}`} aria-hidden="true" />

      {status === 'loading' && (
        <div className="pano-overlay" role="status">
          <span className="pano-spinner" aria-hidden="true" />
          Cargando recorrido 360°…
        </div>
      )}
      {status === 'error' && (
        <div className="pano-overlay pano-overlay--error" role="alert">
          No se pudo cargar el visor 360°. Recarga la página e inténtalo de nuevo.
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="pano-chip">
            <strong>{place.name}</strong>
            <span>Punto {index + 1} de {scenes.length}</span>
          </div>

          <button type="button" className="pano-fs" onClick={toggleFullscreen} aria-label={expanded ? 'Salir de pantalla completa' : 'Pantalla completa'}>
            ⛶
          </button>

          <div className="pano-controls">
            <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0}>
              ‹ Anterior
            </button>
            <div className="pano-dots" role="tablist" aria-label="Puntos del recorrido">
              {scenes.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Ir al punto ${i + 1}`}
                  className={i === index ? 'is-active' : ''}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button type="button" onClick={() => goTo(index + 1)} disabled={index === scenes.length - 1}>
              Siguiente ›
            </button>
          </div>

          <p className="pano-hint">
            {isTouch
              ? 'Desliza para mirar alrededor · Toca las flechas para avanzar'
              : 'Arrastra para mirar alrededor · Haz clic en las flechas para avanzar'}
          </p>
        </>
      )}
    </div>
  );
}
