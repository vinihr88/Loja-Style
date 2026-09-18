// Gera as artes que ocupam o lugar das fotos: ficha técnica em fio de ouro
// sobre ardósia, uma por peça, em 3:4. Rode com: npm run artes
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PRODUTOS, type DadoProduto } from "../prisma/catalogo";

const L = 1200;
const A = 1600;
const ARDOSIA = "#24272b";
const ARDOSIA_ESCURA = "#1b1e21";
const OURO = "#c8a558";
const OURO_FRACO = "#7a6535";

// Silhuetas em traço, por categoria. Coordenadas na caixa 0 0 400 500.
const SILHUETAS: Record<string, string> = {
  camisetas:
    "M120 96 L170 72 Q200 104 230 72 L280 96 L330 140 L296 182 L276 164 L276 424 Q200 438 124 424 L124 164 L104 182 L70 140 Z",
  polos:
    "M120 96 L170 72 Q200 104 230 72 L280 96 L330 140 L296 182 L276 164 L276 424 Q200 438 124 424 L124 164 L104 182 L70 140 Z M176 74 L176 150 L200 168 L224 150 L224 74",
  conjuntos:
    "M132 70 L172 52 Q200 78 228 52 L268 70 L306 106 L280 140 L264 126 L264 258 Q200 270 136 258 L136 126 L120 140 L94 106 Z M142 292 L258 292 L268 470 L214 470 L200 360 L186 470 L132 470 Z",
  jaquetas:
    "M116 92 L168 66 L200 92 L232 66 L284 92 L326 142 L292 186 L272 168 L272 434 L128 434 L128 168 L108 186 L74 142 Z M200 92 L200 434",
  moletons:
    "M118 110 Q200 52 282 110 L330 156 L294 200 L274 182 L274 430 Q200 444 126 430 L126 182 L106 200 L70 156 Z M160 96 Q200 130 240 96 M186 250 L214 250",
  calcas:
    "M136 70 L264 70 L276 150 L268 470 L212 470 L200 250 L188 470 L132 470 L124 150 Z M136 108 L264 108",
  bermudas:
    "M136 70 L264 70 L274 140 L262 320 L212 320 L200 200 L188 320 L138 320 L126 140 Z M136 104 L264 104",
  bones:
    "M92 268 Q104 140 200 132 Q296 140 308 268 Z M308 268 Q372 276 384 306 L300 306 M200 132 L200 268",
  cintos:
    "M64 236 L272 236 L272 292 L64 292 Z M272 236 L352 236 L352 292 L272 292 Z M296 248 L296 280 M320 248 L320 280 M88 250 L248 250 M88 278 L248 278",
};

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function arte(p: DadoProduto, variacao: number): string {
  const silhueta = SILHUETAS[p.categoria] ?? SILHUETAS.camisetas;
  const detalhe = variacao === 2;
  const escala = detalhe ? 2.1 : 1.45;
  const deslocX = detalhe ? L / 2 - 200 * escala - 60 : L / 2 - 200 * escala;
  const deslocY = detalhe ? 300 : 340;

  const medidas = detalhe
    ? [
        ["Gramatura", "180 g/m²"],
        ["Acabamento", "Costura dupla"],
        ["Origem", "São Paulo, SP"],
      ]
    : [
        ["Peça", p.categoria],
        ["Tamanhos", p.tamanhos.join(" · ")],
        ["Cores", p.cores.map((c) => c.nome).join(" · ")],
      ];

  const listaCores = p.cores
    .map((c, i) => `<circle cx="${96 + i * 46}" cy="1438" r="15" fill="${c.hex}" stroke="${OURO_FRACO}" stroke-width="1.5"/>`)
    .join("");

  const linhasMedidas = medidas
    .map(
      ([rotulo, valor], i) => `
    <text x="96" y="${1218 + i * 54}" fill="${OURO_FRACO}" font-family="Georgia, serif" font-size="19" letter-spacing="3">${escapar(rotulo.toUpperCase())}</text>
    <text x="${L - 96}" y="${1218 + i * 54}" fill="#d9d4cb" font-family="Georgia, serif" font-size="22" text-anchor="end">${escapar(valor)}</text>
    <line x1="96" y1="${1236 + i * 54}" x2="${L - 96}" y2="${1236 + i * 54}" stroke="${OURO_FRACO}" stroke-width="0.6" stroke-dasharray="2 6" opacity="0.5"/>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}" role="img" aria-label="${escapar(p.nome)}">
  <defs>
    <linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${ARDOSIA}"/>
      <stop offset="1" stop-color="${ARDOSIA_ESCURA}"/>
    </linearGradient>
    <pattern id="grade" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0 L0 0 0 40" fill="none" stroke="${OURO}" stroke-width="0.4" opacity="0.07"/>
    </pattern>
  </defs>

  <rect width="${L}" height="${A}" fill="url(#fundo)"/>
  <rect width="${L}" height="${A}" fill="url(#grade)"/>
  <rect x="48" y="48" width="${L - 96}" height="${A - 96}" fill="none" stroke="${OURO_FRACO}" stroke-width="1" opacity="0.55"/>

  <text x="96" y="140" fill="${OURO}" font-family="Georgia, serif" font-size="22" letter-spacing="10">KAUÃ STYLE</text>
  <text x="${L - 96}" y="140" fill="${OURO_FRACO}" font-family="Georgia, serif" font-size="20" letter-spacing="4" text-anchor="end">${escapar(p.marca.toUpperCase())}</text>
  <line x1="96" y1="168" x2="${L - 96}" y2="168" stroke="${OURO_FRACO}" stroke-width="1" opacity="0.6"/>

  <g transform="translate(${deslocX} ${deslocY}) scale(${escala})" fill="none" stroke="${OURO}" stroke-width="${detalhe ? 1.4 : 2}" stroke-linejoin="round" stroke-linecap="round" opacity="0.92">
    <path d="${silhueta}"/>
  </g>

  ${
    detalhe
      ? `<g stroke="${OURO_FRACO}" stroke-width="0.8" opacity="0.7">
    <line x1="${L - 300}" y1="360" x2="${L - 140}" y2="360"/>
    <line x1="${L - 300}" y1="620" x2="${L - 140}" y2="620"/>
    <line x1="${L - 220}" y1="360" x2="${L - 220}" y2="620"/>
    <text x="${L - 210}" y="500" fill="${OURO_FRACO}" font-family="Georgia, serif" font-size="20">detalhe</text>
  </g>`
      : ""
  }

  <text x="96" y="1128" fill="#f2efe8" font-family="Georgia, serif" font-size="46">${escapar(p.nome)}</text>
  <text x="96" y="1168" fill="#9b958a" font-family="Georgia, serif" font-size="22">${escapar(p.resumo)}</text>
  ${linhasMedidas}
  ${listaCores}
  <text x="${L - 96}" y="1446" fill="${OURO_FRACO}" font-family="Georgia, serif" font-size="18" letter-spacing="4" text-anchor="end">FICHA ${String(variacao).padStart(2, "0")}</text>
</svg>
`;
}

async function principal() {
  const raiz = join(process.cwd(), "public", "produtos");
  let total = 0;

  for (const produto of PRODUTOS) {
    const pasta = join(raiz, produto.slug);
    await mkdir(pasta, { recursive: true });
    for (const variacao of [1, 2]) {
      await writeFile(join(pasta, `0${variacao}.svg`), arte(produto, variacao), "utf8");
      total += 1;
    }
  }

  console.log(`${total} artes geradas em public/produtos para ${PRODUTOS.length} peças.`);
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
