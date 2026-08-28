// Protótipo — Superfícies de visualização (device frames).
// Toda superfície está sempre disponível, inclusive em projeto web: ver como a
// tela se comporta no celular é parte da revisão, não exclusividade de app nativo.

const SURFACES = {
  desktop: { label: 'Desktop', width: null, height: null, kind: 'free' },
  tablet:  { label: 'Tablet',  width: 834, height: 1112, kind: 'tablet' },
  ios:     { label: 'iOS',     width: 390, height: 800,  kind: 'phone' },
  android: { label: 'Android', width: 390, height: 800,  kind: 'phone' },
};

const SURFACE_ORDER = ['desktop', 'tablet', 'ios', 'android'];

/* ---------- iOS: dynamic island + home indicator ---------- */
const IosFrame = ({ theme, children }) => {
  const { width: W, height: H } = SURFACES.ios;
  const chrome = theme === 'dark' ? '#F5F5F7' : '#1A1A1F';

  return (
    <div style={{
      width: W + 18, height: H + 18,
      background: '#0A0A0E', borderRadius: 56, padding: 9,
      boxShadow: 'var(--shadow-device)', flexShrink: 0,
    }}>
      <div style={{
        width: W, height: H, background: 'var(--bg)',
        borderRadius: 47, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 44,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          padding: '0 28px 8px', fontSize: 13, fontWeight: 700,
          color: chrome, zIndex: 30, pointerEvents: 'none',
        }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
          <span>● ● ● 100%</span>
        </div>

        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 34, background: '#0A0A0E', borderRadius: 24, zIndex: 40,
        }} />

        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 134, height: 5, background: chrome, borderRadius: 3,
          opacity: 0.92, zIndex: 30, pointerEvents: 'none',
        }} />

        <div style={{ position: 'absolute', inset: 0, paddingTop: 44, paddingBottom: 24, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ---------- Android: status bar + gesture bar ---------- */
const AndroidFrame = ({ theme, children }) => {
  const { width: W, height: H } = SURFACES.android;
  const chrome = theme === 'dark' ? '#F5F5F7' : '#1A1A1F';

  return (
    <div style={{
      width: W + 6, height: H + 6,
      background: '#1A1A1F', borderRadius: 32, padding: 3,
      boxShadow: 'var(--shadow-device)', flexShrink: 0,
    }}>
      <div style={{
        width: W, height: H, background: 'var(--bg)',
        borderRadius: 30, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', fontSize: 12, fontWeight: 700,
          color: chrome, zIndex: 30, pointerEvents: 'none',
        }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
          <span>● ● 100%</span>
        </div>

        <div style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          width: 108, height: 4, background: chrome, borderRadius: 2,
          opacity: 0.7, zIndex: 30, pointerEvents: 'none',
        }} />

        <div style={{ position: 'absolute', inset: 0, paddingTop: 28, paddingBottom: 18, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ---------- Tablet: moldura sóbria, sem chrome de SO ---------- */
const TabletFrame = ({ children }) => {
  const { width: W, height: H } = SURFACES.tablet;

  return (
    <div style={{
      width: W + 24, height: H + 24,
      background: '#1A1A1F', borderRadius: 28, padding: 12,
      boxShadow: 'var(--shadow-device)', flexShrink: 0,
    }}>
      <div style={{
        width: W, height: H, background: 'var(--bg)',
        borderRadius: 18, overflow: 'auto', position: 'relative',
      }}>
        {children}
      </div>
    </div>
  );
};

/* ---------- Desktop: sem moldura, ocupa o espaço disponível ---------- */
const FreeSurface = ({ children }) => (
  <div style={{
    width: '100%', height: '100%',
    background: 'var(--bg)', overflow: 'auto',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {children}
  </div>
);

/* ---------- Escala para caber na área disponível ----------
   Sem isto, o frame estoura a viewport em tela pequena e a revisão vira scroll.
   Só reduz: ampliar distorceria a percepção de tamanho real. */
const ScaledSurface = ({ surface, theme, avail, children }) => {
  const spec = SURFACES[surface];

  if (spec.kind === 'free') return <FreeSurface>{children}</FreeSurface>;

  const outerW = spec.width + (surface === 'tablet' ? 24 : surface === 'ios' ? 18 : 6);
  const outerH = spec.height + (surface === 'tablet' ? 24 : surface === 'ios' ? 18 : 6);

  const margin = 48;
  const availW = (avail && avail.width) || 0;
  const availH = (avail && avail.height) || 0;
  const scale = (availW && availH)
    ? Math.min(1, (availW - margin) / outerW, (availH - margin) / outerH)
    : 1;

  const Frame = surface === 'ios' ? IosFrame : surface === 'android' ? AndroidFrame : TabletFrame;

  return (
    <div style={{
      width: outerW * scale, height: outerH * scale,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', flexShrink: 0 }}>
        <Frame theme={theme}>{children}</Frame>
      </div>
    </div>
  );
};

/* ---------- Mede o container para alimentar ScaledSurface ---------- */
const useElementSize = () => {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ width: r.width, height: r.height });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};
