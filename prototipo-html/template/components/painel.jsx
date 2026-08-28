// Protótipo — Painel de controle flutuante do showcase.
//
// Todo controle de revisão vive aqui: superfície, tema, estado e reset. O header
// fica só com a marca e o modo, e o device frame ganha a tela inteira.
// Antes isto ocupava o header em barras de abas — que sumiam em viewport estreita
// justamente quando o protótipo tinha telas demais para caber.

const ESTADOS = ['default', 'hover', 'focus', 'active', 'disabled', 'loading', 'empty', 'error'];

const PainelGrupo = ({ label, options, value, onChange }) => (
  <div className="painel-grupo">
    <div className="painel-grupo-label">{label}</div>
    <div className="painel-opcoes">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={value === opt.value ? 'active' : ''}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const PainelControle = ({
  lang,
  surface, setSurface,
  theme, setTheme,
  estado, setEstado,
  onReset,
}) => {
  const t = useT(lang);
  const [aberto, setAberto] = React.useState(false);
  const painelRef = React.useRef(null);
  const botaoRef = React.useRef(null);

  // Esc fecha e devolve o foco ao botão — sem isso a navegação por teclado fica presa.
  React.useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { setAberto(false); botaoRef.current?.focus(); }
    };
    const onClickFora = (e) => {
      if (painelRef.current && !painelRef.current.contains(e.target)) setAberto(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickFora);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickFora);
    };
  }, [aberto]);

  const resumo = `${SURFACES[surface].label} · ${theme === 'light' ? t('temaClaro') : t('temaEscuro')} · ${estado}`;

  return (
    <div className="painel" ref={painelRef}>
      {aberto && (
        <div className="painel-corpo" role="dialog" aria-label={t('painelTitulo')}>
          <PainelGrupo
            label={t('painelSuperficie')}
            value={surface}
            onChange={setSurface}
            options={SURFACE_ORDER.map((k) => ({ value: k, label: SURFACES[k].label }))}
          />
          <PainelGrupo
            label={t('painelTema')}
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'light', label: t('temaClaro') },
              { value: 'dark', label: t('temaEscuro') },
            ]}
          />
          <PainelGrupo
            label={t('painelEstado')}
            value={estado}
            onChange={setEstado}
            options={ESTADOS.map((s) => ({ value: s, label: s }))}
          />
          <button className="painel-reset" onClick={onReset}>{t('painelReset')}</button>
        </div>
      )}

      <button
        ref={botaoRef}
        className="painel-toggle"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-label={t('painelTitulo')}
      >
        <IconSliders size={15} />
        <span className="painel-resumo">{resumo}</span>
        <span className={`painel-chevron ${aberto ? 'aberto' : ''}`} aria-hidden="true">▾</span>
      </button>
    </div>
  );
};
