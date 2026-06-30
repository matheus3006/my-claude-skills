# Pattern 04 — Layout 2-col na Components page (10:5)

## Quando usar
Sempre que posicionar ou reposicionar ComponentSets/Components na page `Components` (10:5) do file almaFlow. Convenção foi consolidada na evolução cliente v1.5 → v1.6.

## Convenção

| Item | Valor |
|---|---|
| Coluna esquerda | x = **10595** |
| Coluna direita | x = **11600** |
| Gap horizontal entre colunas | ~1005px (de borda a borda da coluna esquerda à direita) |
| Gap vertical entre rows | **80px** |
| Padding interno do set | **20px** (top + horizontal) |
| Gap vertical entre variants dentro do set | **28px** |

### Quando wide vs 2-col

| Largura do ComponentSet | Layout |
|---|---|
| ≤ 700px (ex.: cards, banners, pills) | 2 colunas: left x=10595, right x=11600 |
| 700px–1000px (ex.: cards multi-variant médios) | 2 colunas, mas verificar se não invade right |
| > 1000px (ex.: Client topbar 1696w, Menu item card 2852w) | **Full row** sozinho na coluna left; próximo row 80px abaixo |

## Layout cliente v1.5 + v1.6 final (referência)

| y | x=10595 (left) | x=11600 (right) |
|---|---|---|
| 120 | Client topbar (1696w, full row) | — |
| 296 | Store card (722×136) | Warn banner (367×163) |
| 539 | Queue status hero (722×280) | Category tab (214×70) |
| 899 | Menu item card (2852w, full row) | — |
| 1368 | Pre-order item row (722×120) | Pre-order lock banner (367×377) |
| 1825 | Form field (367×336) | Counter (248×267) |
| 2241 | LGPD consent box (367×188) | Mini-cart pill (147×124) |
| 2509 | Stat tile (140×188) | Menu link CTA (327×44) |
| 2777 | Info row (295×20) | Info card (327×87) |
| 2944 | Cliente pre-order empty (327×280, full row) | — |
| 3304 | Called hero (327×400) | Cancelled hero (327×400) |

Total altura ocupada: ~3704px da Components page para componentes cliente.

## Script de reposicionamento canônico

```js
const COL_L = 10595;
const COL_R = 11600;

const layout = [
  { y: 120,  items: [{ id: "198:248", x: COL_L }] },                                  // Client topbar full
  { y: 296,  items: [{ id: "198:267", x: COL_L }, { id: "198:286", x: COL_R }] },     // Store card / Warn banner
  { y: 539,  items: [{ id: "198:280", x: COL_L }, { id: "198:312", x: COL_R }] },
  { y: 899,  items: [{ id: "198:307", x: COL_L }] },                                  // Menu item card full
  /* ... etc ... */
];

for (const row of layout) {
  for (const it of row.items) {
    const n = await figma.getNodeByIdAsync(it.id);
    n.x = it.x;
    n.y = row.y;
  }
}
```

Ver `references/audit-scripts.js > layoutClienteV16` para o script completo aplicável.

## Cuidados ao adicionar novo componente

1. Calcule a altura final do set (variants + padding interno + gaps). Pode ser preciso adicionar variants primeiro e medir após.
2. Verifique a `bottom` (y + height) do último componente existente.
3. Próxima row começa em `last.bottom + 80`.
4. Decida coluna baseado na largura: > 1000px → full row, ≤ 700px → 2-col.
5. Após posicionar, **rodar `detectOverlaps`** (ver `pattern-05-publication-audit.md`) para garantir 0 overlaps.

## Quando NÃO seguir essa convenção

- **Helpers `_Slot/*`**: ficam fora dessa grid, geralmente alinhados separadamente. Eles não são componentes públicos.
- **Componentes Staff**: já têm seu próprio layout em x < 10000. Não tocar.
- **Variant addition em set existente**: variants dentro do set seguem padding=20 + gap=28, independente da posição do set na page.

## Referência cruzada
- Bug correlato: nenhum direto (essa é convenção positiva, não bug).
- Audit script para detectar overlaps: `pattern-05-publication-audit.md` + `references/audit-scripts.js`.
- A convenção foi documentada após reposicionamento manual em S4 desta sessão para resolver 4 overlaps causados por sets que cresceram após edits.
