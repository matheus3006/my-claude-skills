// Protótipo — Painel de controle flutuante do showcase.
//
// Todo controle de revisão vive aqui: superfície, tema, estado, rotina e reset. O
// header fica só com a marca, as abas e o modo, e o device frame ganha a tela inteira.
// Antes isto ocupava o header em barras de abas — que sumiam em viewport estreita
// justamente quando o protótipo tinha telas demais para caber.

/* Os 8 estados de componente e o offline (sem internet), que é estado da tela. */
const ESTADOS = ['default', 'hover', 'focus', 'active', 'disabled', 'loading', 'empty', 'error', 'offline'];

const PainelGrupo = ({ label, options, value, onChange }) => (
  <div className="painel-grupo">
    <div className="painel-grupo-label">{label}</div>
    <div className="painel-opcoes">
      {options.map((opcao) => (
        <button
          key={opcao.value}
          className={value === opcao.value ? 'active' : ''}
          onClick={() => onChange(opcao.value)}
          aria-pressed={value === opcao.value}
        >
          {opcao.label}
        </button>
      ))}
    </div>
  </div>
);

/* "Ver um item: 2 de 3 toques · concluída". Acima da meta fica marcado em texto,
   não só em cor. */
const textoDaContagem = (t, contagem) => {
  if (!contagem) return '';
  const meta = metaDaRotina(contagem.rotina);
  const partes = [`${contagem.rotina.rotulo}: ${t('rotinaToques', { toques: contagem.toques, meta })}`];
  if (contagem.concluida) partes.push(t('rotinaConcluida'));
  if (contagem.toques > meta) partes.push(t('rotinaAcimaDaMeta'));
  return partes.join(' · ');
};

const PainelControle = ({
  lang,
  visao,
  surface, setSurface,
  theme, setTheme,
  estado, setEstado,
  contagem, iniciarRotina,
  onReset,
}) => {
  const t = useT(lang);
  const [aberto, setAberto] = React.useState(false);
  const painelRef = React.useRef(null);
  const botaoRef = React.useRef(null);
  const rotinas = rotinasDaVisao(visao.id);

  // Esc fecha e devolve o foco ao botão — sem isso a navegação por teclado fica presa.
  React.useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') { setAberto(false); botaoRef.current?.focus(); }
    };
    const aoClicarFora = (evento) => {
      if (painelRef.current && !painelRef.current.contains(evento.target)) setAberto(false);
    };
    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('mousedown', aoClicarFora);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('mousedown', aoClicarFora);
    };
  }, [aberto]);

  const resumoDaContagem = contagem ? ` · ${contagem.toques}/${metaDaRotina(contagem.rotina)}` : '';
  const resumo = `${SURFACES[surface].label} · ${theme === 'light' ? t('temaClaro') : t('temaEscuro')} · ${estado}${resumoDaContagem}`;

  return (
    <div className="painel" ref={painelRef}>
      {aberto && (
        <div className="painel-corpo" role="dialog" aria-label={t('painelTitulo')}>
          <PainelGrupo
            label={t('painelSuperficie')}
            value={surface}
            onChange={setSurface}
            options={visao.superficies.map((chave) => ({ value: chave, label: SURFACES[chave].label }))}
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
            options={ESTADOS.map((nomeDoEstado) => ({ value: nomeDoEstado, label: nomeDoEstado }))}
          />
          {rotinas.length > 0 && (
            <div className="painel-grupo">
              <PainelGrupo
                label={t('painelRotina')}
                value={contagem ? contagem.rotina.id : ''}
                onChange={(idDaRotina) => iniciarRotina(idDaRotina || null)}
                options={[
                  { value: '', label: t('rotinaNenhuma') },
                  ...rotinas.map((rotina) => ({ value: rotina.id, label: rotina.rotulo })),
                ]}
              />
              {contagem && (
                <div
                  className={`painel-contagem ${contagem.toques > metaDaRotina(contagem.rotina) ? 'acima' : ''}`}
                  aria-live="polite"
                >
                  {textoDaContagem(t, contagem)}
                </div>
              )}
            </div>
          )}
          <button className="painel-reset" onClick={onReset}>{t('painelReset')}</button>
        </div>
      )}

      <button
        ref={botaoRef}
        className="painel-toggle"
        onClick={() => setAberto((estaAberto) => !estaAberto)}
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
