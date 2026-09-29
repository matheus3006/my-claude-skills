"""Monta o mapa visual: injeta mapa.json no template.html e escreve index.html.

Uso:  python3 montar.py <mapa.json> <pasta_saida> [--sem-rede]

Antes de injetar, atualiza do GitHub (gh CLI) o estado e os rótulos de cada nó e as cores dos
rótulos, para o mapa mostrar o status que o tracker tem AGORA, não o do levantamento.
--sem-rede pula essa atualização e usa o que está no mapa.json.
"""
import json
import pathlib
import subprocess
import sys

pasta_modelo = pathlib.Path(__file__).parent


def rodar_gh(argumentos_gh):
    return json.loads(subprocess.run(["gh", *argumentos_gh], capture_output=True, text=True, check=True).stdout)


def atualizar_do_github(dados_do_mapa):
    repositorio = dados_do_mapa["repositorio"]
    rotulos_do_repo = rodar_gh(["label", "list", "--repo", repositorio, "--limit", "200", "--json", "name,color,description"])
    dados_do_mapa["cores_label"] = {rotulo["name"]: {"cor": rotulo["color"], "descricao": rotulo["description"]} for rotulo in rotulos_do_repo}
    for no in dados_do_mapa["nos"]:
        issue_atual = rodar_gh(["issue", "view", str(no["id"]), "--repo", repositorio, "--json", "state,labels"])
        no["estado"] = issue_atual["state"].lower()
        no["labels"] = [rotulo["name"] for rotulo in issue_atual["labels"]]
        if no["estado"] == "closed":
            no["pronto_para_agente"] = False


def conferir_consistencia(dados_do_mapa):
    ids_dos_nos = {no["id"] for no in dados_do_mapa["nos"]}
    chave_do_grupo = (dados_do_mapa.get("grupo") or {}).get("chave")
    ids_das_ondas = {onda["id"] for onda in dados_do_mapa["ondas"]}
    ids_das_jornadas = {jornada["id"] for jornada in dados_do_mapa["jornadas"]}
    problemas = []
    for no in dados_do_mapa["nos"]:
        if no.get("onda") not in ids_das_ondas:
            problemas.append(f"nó {no['id']} sem onda válida")
        if no.get("jornada") not in ids_das_jornadas:
            problemas.append(f"nó {no['id']} com jornada desconhecida: {no.get('jornada')}")
    for aresta in dados_do_mapa["arestas"]:
        for ponta in (aresta["de"], aresta["para"]):
            if ponta not in ids_dos_nos and ponta != chave_do_grupo:
                problemas.append(f"aresta aponta para nó inexistente: {ponta}")
        if aresta["tipo"] == "inferida" and not aresta.get("motivo"):
            problemas.append(f"aresta inferida {aresta['de']}→{aresta['para']} sem motivo")
    for alerta in dados_do_mapa["alertas"]:
        for id_resolvido in alerta["resolve"]:
            if id_resolvido not in ids_dos_nos:
                problemas.append(f"alerta '{alerta['titulo']}' cita nó inexistente: {id_resolvido}")
    if problemas:
        sys.exit("mapa.json inconsistente:\n- " + "\n- ".join(problemas))


def main():
    caminho_mapa, pasta_saida = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    dados_do_mapa = json.loads(caminho_mapa.read_text())
    conferir_consistencia(dados_do_mapa)
    if "--sem-rede" not in sys.argv:
        atualizar_do_github(dados_do_mapa)
    dados_do_mapa.setdefault("cores_label", {})
    modelo_html = (pasta_modelo / "template.html").read_text()
    html_final = modelo_html.replace("/*__DADOS__*/null", json.dumps(dados_do_mapa, ensure_ascii=False))
    pasta_saida.mkdir(parents=True, exist_ok=True)
    (pasta_saida / "index.html").write_text(html_final)
    print(f"{pasta_saida / 'index.html'}: {len(dados_do_mapa['nos'])} nós, {len(dados_do_mapa['arestas'])} arestas, {len(dados_do_mapa['alertas'])} alertas")


main()
