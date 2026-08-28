// Protótipo — Showcase shell.
// Header enxuto (marca + modo). Todo o resto dos controles fica no painel
// flutuante, para o device frame ganhar a tela inteira.

const detectLang = () => {
  const nav = (navigator.language || 'pt-BR').toLowerCase();
  if (nav.startsWith('pt')) return 'pt-BR';
  if (nav.startsWith('es')) return 'es';
  return 'en';
};

/* Mapa rota → componente. Vive aqui porque app.jsx carrega por último e é o
   único que enxerga router e telas ao mesmo tempo. */
const SCREEN_MAP = {
  HOME: TelaHome,
  DETAIL: TelaDetalhe,
};

class PrototypeErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[Showcase]', this.props.contexto, error, info); }
  componentDidUpdate(prev) {
    if (prev.contexto !== this.props.contexto && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error) {
      const e = this.state.error;
      return (
        <div style={{
          padding: 'var(--space-6)', display: 'flex', flexDirection: 'column',
          gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'center',
          color: 'var(--danger)', textAlign: 'center', height: '100%',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Render error em "{this.props.contexto}"</div>
          <code style={{
            fontSize: 12, padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--fg)', maxWidth: '100%', overflow: 'auto',
            whiteSpace: 'pre-wrap', textAlign: 'left',
          }}>{String(e?.stack || e?.message || e)}</code>
        </div>
      );
    }
    return this.props.children;
  }
}

/* Tela ativa segundo a rota. */
const TelaAtual = ({ lang, estado }) => {
  const { route } = useRouter();
  const Screen = SCREEN_MAP[route.name] || SCREEN_MAP.HOME;
  return <Screen lang={lang} estado={estado} params={route.params} />;
};

/* Modo Showcase: todas as telas lado a lado, para revisão de conjunto. */
const GradeDeTelas = ({ lang, estado }) => {
  const alvos = [
    { rota: 'HOME', params: {} },
    { rota: 'DETAIL', params: { id: MOCK_ITEMS[0].id } },
  ];

  return (
    <div className="showcase-grade">
      {alvos.map(({ rota, params }) => {
        const Screen = SCREEN_MAP[rota];
        return (
          <div key={rota} className="grade-tile">
            <div className="grade-tile-label">{rota}</div>
            <div className="grade-tile-viewport">
              <PrototypeErrorBoundary contexto={rota}>
                <Screen lang={lang} estado={estado} params={params} />
              </PrototypeErrorBoundary>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Showcase = () => {
  const [lang] = React.useState(detectLang());
  const [surface, setSurface] = React.useState(DEFAULTS.surface);
  const [theme, setTheme] = React.useState(DEFAULTS.theme);
  const [estado, setEstado] = React.useState(DEFAULTS.estado);
  const [mode, setMode] = React.useState(DEFAULTS.mode);
  const [bodyRef, bodySize] = useElementSize();
  const t = useT(lang);

  React.useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  const resetar = () => {
    setSurface(DEFAULTS.surface);
    setTheme(DEFAULTS.theme);
    setEstado(DEFAULTS.estado);
    setMode(DEFAULTS.mode);
    window.location.hash = '';
  };

  return (
    <RouterProvider>
      <div className="showcase-shell">
        <header className="showcase-header">
          <div className="showcase-brand">
            <span>{t('appName')}</span>
            <span className="accent">•</span>
          </div>

          <div className="showcase-modo">
            <button
              className={mode === 'prototype' ? 'active' : ''}
              onClick={() => setMode('prototype')}
              aria-pressed={mode === 'prototype'}
            >
              {t('modoPrototipo')}
            </button>
            <button
              className={mode === 'showcase' ? 'active' : ''}
              onClick={() => setMode('showcase')}
              aria-pressed={mode === 'showcase'}
            >
              {t('modoShowcase')}
            </button>
          </div>
        </header>

        <main className={`showcase-body ${mode === 'showcase' ? 'showcase-body--grade' : ''}`} ref={bodyRef}>
          {mode === 'prototype' ? (
            <ScaledSurface surface={surface} theme={theme} avail={bodySize}>
              <PrototypeErrorBoundary contexto={`${surface}/${estado}`}>
                <TelaAtual lang={lang} estado={estado} />
              </PrototypeErrorBoundary>
            </ScaledSurface>
          ) : (
            <GradeDeTelas lang={lang} estado={estado} />
          )}
        </main>

        <PainelControle
          lang={lang}
          surface={surface} setSurface={setSurface}
          theme={theme} setTheme={setTheme}
          estado={estado} setEstado={setEstado}
          onReset={resetar}
        />
      </div>
    </RouterProvider>
  );
};
