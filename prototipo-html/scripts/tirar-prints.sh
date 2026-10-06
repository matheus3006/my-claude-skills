#!/usr/bin/env bash
# Tira os prints da conferência de uma rotina (ou de todas) de um protótipo servido.
#
# Uso: tirar-prints.sh <endereco-do-prototipo> <id-da-rotina|todas> <pasta-de-saida> [idioma]
#   ex.: tirar-prints.sh http://localhost:8765 turno-do-caixa prototipos/appetito-v2/prints
# O idioma padrão é pt-BR; passe outro locale de i18n.jsx quando o projeto for de outra língua.
#
# A lista de combinações vem do próprio protótipo (?listarPrints=<rotina>), montada a
# partir de visoes.jsx: estado normal em todas as superfícies e temas da aba, e vazio,
# erro, carregando e sem internet na combinação de abertura.
set -euo pipefail

if [ "$#" -lt 3 ] || [ "$#" -gt 4 ]; then
  echo "Uso: $0 <endereco-do-prototipo> <id-da-rotina|todas> <pasta-de-saida> [idioma]" >&2
  exit 2
fi

endereco_do_prototipo="${1%/}"
id_da_rotina="$2"
pasta_de_saida="$3"
idioma="${4:-pt-BR}"

navegador=""
for candidato in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium" \
  "$(command -v google-chrome 2>/dev/null || true)" \
  "$(command -v chromium 2>/dev/null || true)" \
  "$(command -v chromium-browser 2>/dev/null || true)"; do
  if [ -n "$candidato" ] && [ -x "$candidato" ]; then navegador="$candidato"; break; fi
done
if [ -z "$navegador" ]; then
  echo "Nenhum Chrome ou Chromium encontrado para tirar os prints." >&2
  exit 1
fi

# O Babel transpila no navegador: o tempo virtual dá a ele chance de terminar.
tempo_de_renderizacao_ms=6000

dom_da_lista="$("$navegador" --headless=new --disable-gpu --virtual-time-budget="$tempo_de_renderizacao_ms" \
  --dump-dom "$endereco_do_prototipo/?listarPrints=$id_da_rotina" 2>/dev/null)"

lista_de_prints="$(DOM="$dom_da_lista" python3 - <<'PY'
import html, json, os, re, sys
dom = os.environ["DOM"]
achado = re.search(r'<pre id="lista-de-prints">(.*?)</pre>', dom, re.S)
if not achado:
    sys.exit("A página não devolveu a lista de prints. O protótipo está servido e a rotina existe em visoes.jsx?")
for print_da_lista in json.loads(html.unescape(achado.group(1))):
    print("\t".join([print_da_lista["arquivo"], print_da_lista["endereco"], str(print_da_lista["largura"]), str(print_da_lista["altura"])]))
PY
)"

if [ -z "$lista_de_prints" ]; then
  echo "Nenhum print para \"$id_da_rotina\". Confira o id da rotina em visoes.jsx." >&2
  exit 1
fi

# O endereço vem como ?parametros#/rota; o idioma entra antes da rota.
adicionar_idioma() {
  local endereco_da_combinacao="$1"
  echo "${endereco_da_combinacao/\#/&idioma=$idioma#}"
}

quantidade_de_prints=0
while IFS=$'\t' read -r arquivo endereco largura altura; do
  destino="$pasta_de_saida/$arquivo"
  mkdir -p "$(dirname "$destino")"
  "$navegador" --headless=new --disable-gpu --hide-scrollbars \
    --virtual-time-budget="$tempo_de_renderizacao_ms" \
    --window-size="$largura,$altura" \
    --screenshot="$destino" "$endereco_do_prototipo/$(adicionar_idioma "$endereco")" >/dev/null 2>&1
  echo "$destino"
  quantidade_de_prints=$((quantidade_de_prints + 1))
done <<< "$lista_de_prints"

echo "$quantidade_de_prints prints em $pasta_de_saida" >&2
