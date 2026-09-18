// Catálogo da loja. Preço sempre em centavos.
// Os slugs são os mesmos das URLs publicadas — não renomeie sem redirecionar.

export type DadoVariante = { tamanho: string; cor: string; corHex: string; estoque: number };

export type DadoProduto = {
  slug: string;
  nome: string;
  marca: string;
  categoria: string;
  colecoes: string[];
  resumo: string;
  descricao: string;
  precoCentavos: number;
  precoPromocionalCentavos?: number;
  destaque?: boolean;
  lancamento?: boolean;
  cores: { nome: string; hex: string }[];
  tamanhos: string[];
  estoquePorTamanho?: Record<string, number>;
};

export const CATEGORIAS = [
  { slug: "conjuntos", nome: "Conjuntos", ordem: 1 },
  { slug: "camisetas", nome: "Camisetas", ordem: 2 },
  { slug: "polos", nome: "Polos", ordem: 3 },
  { slug: "jaquetas", nome: "Jaquetas", ordem: 4 },
  { slug: "moletons", nome: "Moletons", ordem: 5 },
  { slug: "calcas", nome: "Calças", ordem: 6 },
  { slug: "bermudas", nome: "Bermudas", ordem: 7 },
  { slug: "bones", nome: "Bonés", ordem: 8 },
  { slug: "cintos", nome: "Cintos", ordem: 9 },
];

export const COLECOES = [
  {
    slug: "noite-de-gala",
    nome: "Noite de gala",
    descricao: "Peças com brilho controlado: strass, dourado e alfaiataria para a noite.",
    destaque: true,
    ordem: 1,
  },
  {
    slug: "conjuntos-completos",
    nome: "Conjuntos completos",
    descricao: "Look fechado em uma escolha só — camiseta e calça com o mesmo acabamento.",
    destaque: true,
    ordem: 2,
  },
  {
    slug: "verao-linho",
    nome: "Verão em linho",
    descricao: "Tecido leve, caimento solto e cores neutras para o calor.",
    destaque: true,
    ordem: 3,
  },
  {
    slug: "essenciais",
    nome: "Essenciais",
    descricao: "A base do guarda-roupa: peças lisas, listradas e de uso diário.",
    destaque: false,
    ordem: 4,
  },
  {
    slug: "acessorios",
    nome: "Acessórios",
    descricao: "Bonés e cintos que fecham o look.",
    destaque: true,
    ordem: 5,
  },
];

const PMG = ["P", "M", "G", "GG"];
const UNICO = ["ÚNICO"];
const NUMERICO = ["38", "40", "42", "44", "46"];
const CINTO = ["90", "95", "100"];

const PRETO = { nome: "Preto", hex: "#141414" };
const OFF_WHITE = { nome: "Off white", hex: "#efe9dd" };
const BRANCO = { nome: "Branco", hex: "#f7f7f5" };
const GRAFITE = { nome: "Grafite", hex: "#3a3d42" };
const BEGE = { nome: "Bege", hex: "#c9b193" };
const DOURADO = { nome: "Dourado", hex: "#c8a558" };
const AZUL = { nome: "Azul marinho", hex: "#1f2a44" };
const VINHO = { nome: "Vinho", hex: "#5b1f2a" };

export const PRODUTOS: DadoProduto[] = [
  // ---------------------------------------------------------------- conjuntos
  {
    slug: "conjunto-casablanca-noir",
    nome: "Conjunto Casablanca Noir",
    marca: "Casablanca",
    categoria: "conjuntos",
    colecoes: ["conjuntos-completos", "noite-de-gala"],
    resumo: "Camiseta e calça em viscose preta com barra acetinada.",
    descricao:
      "Conjunto de camiseta e calça em viscose encorpada, com toque frio e leve brilho natural do fio. A camiseta tem corte reto e ombro levemente caído; a calça tem cós com elástico interno, cordão embutido e caimento fluido até a barra acetinada. É o tipo de peça que resolve a noite inteira sem pedir acessório: veste sozinha.\n\nComposição: 96% viscose, 4% elastano. Forro interno no cós. Lavar à mão ou em ciclo delicado, secar à sombra.",
    precoCentavos: 34900,
    destaque: true,
    cores: [PRETO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 4, M: 7, G: 6, GG: 3 },
  },
  {
    slug: "conjunto-balmain-money",
    nome: "Conjunto Balmain Money",
    marca: "Balmain",
    categoria: "conjuntos",
    colecoes: ["conjuntos-completos", "noite-de-gala"],
    resumo: "Estampa money dourada sobre base preta, camiseta e calça.",
    descricao:
      "Conjunto com estampa dourada aplicada em alta definição sobre malha penteada preta. O dourado tem acabamento fosco, sem plástico e sem craquelar na lavagem. Calça de moletom com punho na barra, bolso faca e bolso traseiro com pespontos reforçados.\n\nComposição: 92% algodão, 8% elastano. Estampa em silk digital. Lavar do avesso.",
    precoCentavos: 37900,
    precoPromocionalCentavos: 32900,
    destaque: true,
    cores: [PRETO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 3, M: 5, G: 5, GG: 2 },
  },
  {
    slug: "conjunto-burberry-check",
    nome: "Conjunto Burberry Check",
    marca: "Burberry",
    categoria: "conjuntos",
    colecoes: ["conjuntos-completos"],
    resumo: "Xadrez clássico em bege e grafite, camiseta e bermuda.",
    descricao:
      "Conjunto em piquê de algodão com o xadrez aplicado em faixa no peito e na lateral da bermuda. O padrão é impresso com registro alinhado entre as duas peças — vestidas juntas, o desenho continua. Bermuda com cós elástico e cordão de algodão encerado.\n\nComposição: 100% algodão piquê. Lavar em água fria para preservar o contraste do xadrez.",
    precoCentavos: 32900,
    cores: [BEGE, GRAFITE],
    tamanhos: PMG,
    estoquePorTamanho: { P: 3, M: 6, G: 5, GG: 3 },
  },
  {
    slug: "conjunto-ea7-destroyed",
    nome: "Conjunto EA7 Destroyed",
    marca: "EA7",
    categoria: "conjuntos",
    colecoes: ["conjuntos-completos"],
    resumo: "Camiseta e calça jeans com puídos feitos à mão.",
    descricao:
      "Camiseta de malha pesada com logo bordado no peito e calça jeans com destroyed feito peça a peça — nenhuma sai igual à outra. O rasgo tem tela interna nos joelhos, o que segura o desgaste e evita que abra com o uso.\n\nComposição: camiseta 100% algodão; calça 98% algodão, 2% elastano. Lavar do avesso, sem amaciante.",
    precoCentavos: 39900,
    lancamento: true,
    cores: [PRETO, AZUL],
    tamanhos: PMG,
    estoquePorTamanho: { P: 2, M: 4, G: 4, GG: 2 },
  },
  {
    slug: "conjunto-emporio-armani-linha-branca",
    nome: "Conjunto Emporio Armani Linha Branca",
    marca: "Emporio Armani",
    categoria: "conjuntos",
    colecoes: ["conjuntos-completos", "verao-linho"],
    resumo: "Off white com faixa logo na manga e na lateral.",
    descricao:
      "Conjunto claro em malha de algodão com faixa emborrachada na manga e na lateral da calça. O off white é tingido em banho único, o que mantém as duas peças exatamente no mesmo tom — problema comum em conjuntos claros comprados separados.\n\nComposição: 95% algodão, 5% elastano. Lavar separado das peças escuras nas primeiras vezes.",
    precoCentavos: 33900,
    cores: [OFF_WHITE],
    tamanhos: PMG,
    estoquePorTamanho: { P: 4, M: 6, G: 4, GG: 2 },
  },

  // ---------------------------------------------------------------- camisetas
  {
    slug: "camiseta-balmain-paris-strass",
    nome: "Camiseta Balmain Paris Strass",
    marca: "Balmain",
    categoria: "camisetas",
    colecoes: ["noite-de-gala"],
    resumo: "Lettering Paris cravejado em strass sobre malha preta.",
    descricao:
      "Malha penteada de gramatura alta com lettering aplicado em strass pedra a pedra. Cada pedra é fixada a quente individualmente, com reforço no verso — não é transfer de folha. A gola tem ribana dupla, que segura o formato mesmo com uso frequente.\n\nComposição: 100% algodão penteado 30.1. Lavar do avesso, à mão, sem torcer.",
    precoCentavos: 18900,
    destaque: true,
    cores: [PRETO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 5, M: 9, G: 8, GG: 4 },
  },
  {
    slug: "camiseta-balmain-monograma",
    nome: "Camiseta Balmain Monograma",
    marca: "Balmain",
    categoria: "camisetas",
    colecoes: ["essenciais"],
    resumo: "Monograma em relevo emborrachado, corte reto.",
    descricao:
      "Monograma aplicado em relevo emborrachado de alta densidade, centralizado no peito. O corte é reto, com ombro na medida e barra reta — cai bem tanto por dentro da calça quanto por fora.\n\nComposição: 100% algodão. Aplicação em PU. Não passar ferro sobre a estampa.",
    precoCentavos: 16900,
    cores: [PRETO, OFF_WHITE],
    tamanhos: PMG,
    estoquePorTamanho: { P: 6, M: 10, G: 9, GG: 5 },
  },
  {
    slug: "camiseta-balmain-manga-cravejada",
    nome: "Camiseta Balmain Manga Cravejada",
    marca: "Balmain",
    categoria: "camisetas",
    colecoes: ["noite-de-gala"],
    resumo: "Faixa de strass contornando as duas mangas.",
    descricao:
      "Faixa de strass aplicada em toda a volta da manga, no mesmo tom da pele do metal, sem contraste berrante. A malha é lisa e pesada, o que mantém a manga no lugar e evita que o peso das pedras puxe o tecido.\n\nComposição: 100% algodão penteado. Lavar do avesso, à mão.",
    precoCentavos: 19900,
    cores: [PRETO, BRANCO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 4, M: 7, G: 6, GG: 3 },
  },
  {
    slug: "camiseta-armani-exchange-strass",
    nome: "Camiseta Armani Exchange Strass",
    marca: "Armani Exchange",
    categoria: "camisetas",
    colecoes: ["noite-de-gala"],
    resumo: "Logo A|X cravejado, malha fria com leve brilho.",
    descricao:
      "Logo aplicado em strass sobre malha fria, de toque acetinado e caimento mais solto que o algodão comum. Peça pensada para a noite: reflete pouco e na medida certa sob luz baixa.\n\nComposição: 92% poliamida, 8% elastano. Lavar à mão, secar à sombra.",
    precoCentavos: 17900,
    precoPromocionalCentavos: 14900,
    cores: [PRETO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 3, M: 6, G: 5, GG: 3 },
  },
  {
    slug: "camiseta-ea7-logo-oval",
    nome: "Camiseta EA7 Logo Oval",
    marca: "EA7",
    categoria: "camisetas",
    colecoes: ["essenciais"],
    resumo: "Logo oval bordado no peito, algodão pesado.",
    descricao:
      "Bordado compacto no peito, feito em fio brilhante sobre malha de 180 g/m². Gramatura alta significa camiseta que não fica transparente e não deforma no ombro depois de algumas lavagens.\n\nComposição: 100% algodão. Bordado com fio poliéster. Lavagem à máquina em ciclo normal.",
    precoCentavos: 14900,
    destaque: true,
    cores: [PRETO, BRANCO, AZUL],
    tamanhos: PMG,
    estoquePorTamanho: { P: 7, M: 12, G: 10, GG: 6 },
  },
  {
    slug: "camiseta-ea7-gola-contraste",
    nome: "Camiseta EA7 Gola Contraste",
    marca: "EA7",
    categoria: "camisetas",
    colecoes: ["essenciais"],
    resumo: "Ribana em cor contrastante na gola e nos punhos.",
    descricao:
      "Gola e punhos em ribana de cor contrastante, no estilo ringer clássico, com logo pequeno no peito. A ribana é tricotada à parte e costurada com máquina de ponto elástico, que acompanha o movimento sem estourar.\n\nComposição: 100% algodão. Lavar do avesso.",
    precoCentavos: 13900,
    cores: [BRANCO, PRETO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 5, M: 8, G: 7, GG: 4 },
  },
  {
    slug: "camiseta-emporio-armani-faixa-logo",
    nome: "Camiseta Emporio Armani Faixa Logo",
    marca: "Emporio Armani",
    categoria: "camisetas",
    colecoes: ["essenciais"],
    resumo: "Faixa horizontal com o logo no peito.",
    descricao:
      "Faixa larga atravessando o peito com o logo repetido em baixo contraste. O desenho é impresso em silk de base d'água, que entra na fibra em vez de formar camada plástica — a peça continua respirando.\n\nComposição: 100% algodão. Silk base d'água. Não usar alvejante.",
    precoCentavos: 15900,
    cores: [PRETO, OFF_WHITE],
    tamanhos: PMG,
    estoquePorTamanho: { P: 4, M: 8, G: 7, GG: 4 },
  },
  {
    slug: "camiseta-prada-nylon-preta",
    nome: "Camiseta Prada Nylon Preta",
    marca: "Prada",
    categoria: "camisetas",
    colecoes: ["essenciais"],
    resumo: "Bolso em nylon técnico e etiqueta metálica.",
    descricao:
      "Camiseta de algodão com bolso em nylon técnico no peito e etiqueta metálica costurada na lateral. O nylon é o mesmo usado em peças de outerwear: resiste a puxão e não amassa.\n\nComposição: corpo 100% algodão, bolso 100% poliamida. Lavar do avesso, sem torcer.",
    precoCentavos: 17900,
    cores: [PRETO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 4, M: 7, G: 6, GG: 3 },
  },
  {
    slug: "camiseta-prada-nylon-off-white",
    nome: "Camiseta Prada Nylon Off White",
    marca: "Prada",
    categoria: "camisetas",
    colecoes: ["essenciais", "verao-linho"],
    resumo: "Versão clara com bolso técnico e etiqueta metálica.",
    descricao:
      "Mesma construção da versão preta, em off white levemente quebrado — tom que não amarela com o tempo como o branco puro. Bolso em nylon e etiqueta metálica na lateral.\n\nComposição: corpo 100% algodão, bolso 100% poliamida. Lavar separado nas primeiras vezes.",
    precoCentavos: 17900,
    cores: [OFF_WHITE],
    tamanhos: PMG,
    estoquePorTamanho: { P: 3, M: 6, G: 5, GG: 3 },
  },
  {
    slug: "camiseta-listrada-fina",
    nome: "Camiseta Listrada Fina",
    marca: "KAUÃ STYLE",
    categoria: "camisetas",
    colecoes: ["essenciais", "verao-linho"],
    resumo: "Listras finas tricotadas no fio, não impressas.",
    descricao:
      "Listras tricotadas direto na malha, fio a fio. Diferente da estampa, a listra tricotada não desbota nem descola — some junto com a peça, daqui a muitos anos. Corte reto e gola fina.\n\nComposição: 100% algodão. Lavagem à máquina em água fria.",
    precoCentavos: 12900,
    cores: [OFF_WHITE, AZUL],
    tamanhos: PMG,
    estoquePorTamanho: { P: 6, M: 9, G: 8, GG: 5 },
  },
  {
    slug: "camiseta-ringer-off-white",
    nome: "Camiseta Ringer Off White",
    marca: "KAUÃ STYLE",
    categoria: "camisetas",
    colecoes: ["essenciais"],
    resumo: "Ringer clássica com ribana preta e barra reta.",
    descricao:
      "Corte ringer clássico: gola e punho em ribana escura sobre corpo claro. Malha de gramatura média, macia desde a primeira vez, sem aquele encardido que aparece em algodão de baixa qualidade.\n\nComposição: 100% algodão penteado. Lavar do avesso.",
    precoCentavos: 12900,
    precoPromocionalCentavos: 9900,
    cores: [OFF_WHITE],
    tamanhos: PMG,
    estoquePorTamanho: { P: 5, M: 8, G: 6, GG: 4 },
  },

  // -------------------------------------------------------------------- polos
  {
    slug: "polo-gucci-gg-relevo",
    nome: "Polo Gucci GG Relevo",
    marca: "Gucci",
    categoria: "polos",
    colecoes: ["essenciais"],
    resumo: "Piquê com padrão GG em relevo e gola canelada.",
    descricao:
      "Piquê de algodão com o padrão trabalhado em relevo no próprio tecido — o desenho aparece pela textura, não pela cor. Gola canelada com estrutura firme, que não enrola na ponta, e abertura com três botões de madrepérola.\n\nComposição: 100% algodão piquê. Lavar em água fria, passar ferro morno na gola.",
    precoCentavos: 19900,
    destaque: true,
    cores: [PRETO, BEGE],
    tamanhos: PMG,
    estoquePorTamanho: { P: 4, M: 8, G: 7, GG: 4 },
  },
  {
    slug: "polo-casablanca-jacquard",
    nome: "Polo Casablanca Jacquard",
    marca: "Casablanca",
    categoria: "polos",
    colecoes: ["verao-linho", "noite-de-gala"],
    resumo: "Jacquard geométrico tricotado, caimento solto.",
    descricao:
      "Tricô jacquard com desenho geométrico em dois tons, feito no ponto e não impresso. O caimento é solto de propósito: a peça foi modelada para cair sobre a calça, sem marcar o corpo.\n\nComposição: 70% viscose, 30% poliamida. Lavar à mão, secar na horizontal para não deformar.",
    precoCentavos: 22900,
    lancamento: true,
    cores: [OFF_WHITE, VINHO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 3, M: 5, G: 5, GG: 2 },
  },
  {
    slug: "polo-canelada-gola-listra",
    nome: "Polo Canelada Gola Listra",
    marca: "KAUÃ STYLE",
    categoria: "polos",
    colecoes: ["essenciais", "verao-linho"],
    resumo: "Canelada com gola listrada e três botões.",
    descricao:
      "Malha canelada que acompanha o corpo sem apertar, com gola em listras contrastantes. A canela dá elasticidade natural ao tecido — veste bem em corpos diferentes dentro do mesmo tamanho.\n\nComposição: 95% viscose, 5% elastano. Lavar à mão.",
    precoCentavos: 15900,
    cores: [PRETO, OFF_WHITE, VINHO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 5, M: 7, G: 6, GG: 3 },
  },

  // ----------------------------------------------------------------- jaquetas
  {
    slug: "jaqueta-balmain-dourada",
    nome: "Jaqueta Balmain Dourada",
    marca: "Balmain",
    categoria: "jaquetas",
    colecoes: ["noite-de-gala"],
    resumo: "Acabamento metalizado dourado com zíper grosso.",
    descricao:
      "Jaqueta com acabamento metalizado dourado sobre base preta, zíper grosso de metal e forro interno em cetim. O metalizado é aplicado por laminação a quente, técnica que aguenta dobra sem descascar nos vincos.\n\nComposição: 100% poliéster, forro 100% viscose. Limpeza a seco.",
    precoCentavos: 54900,
    destaque: true,
    cores: [DOURADO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 2, M: 3, G: 3, GG: 1 },
  },
  {
    slug: "jaqueta-balmain-medalhao-strass",
    nome: "Jaqueta Balmain Medalhão Strass",
    marca: "Balmain",
    categoria: "jaquetas",
    colecoes: ["noite-de-gala"],
    resumo: "Medalhão cravejado nas costas, gola alta.",
    descricao:
      "Medalhão em strass aplicado nas costas, com gola alta e punho canelado. O peso da aplicação é distribuído por uma entretela interna, o que impede que o tecido repuxe no ombro.\n\nComposição: 100% poliéster, entretela de reforço. Não lavar à máquina.",
    precoCentavos: 49900,
    precoPromocionalCentavos: 42900,
    cores: [PRETO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 2, M: 4, G: 3, GG: 2 },
  },
  {
    slug: "jaqueta-balmain-faixa-ombro",
    nome: "Jaqueta Balmain Faixa Ombro",
    marca: "Balmain",
    categoria: "jaquetas",
    colecoes: ["noite-de-gala"],
    resumo: "Faixas contrastantes no ombro, corte bomber.",
    descricao:
      "Corte bomber com faixas contrastantes atravessando o ombro e descendo pela manga. Punho, gola e barra em ribana elástica, que fecha o vento sem apertar.\n\nComposição: 100% poliéster, forro em malha. Lavar à mão em água fria.",
    precoCentavos: 44900,
    cores: [PRETO, AZUL],
    tamanhos: PMG,
    estoquePorTamanho: { P: 2, M: 4, G: 4, GG: 2 },
  },
  {
    slug: "jaqueta-balmain-etiqueta",
    nome: "Jaqueta Balmain Etiqueta",
    marca: "Balmain",
    categoria: "jaquetas",
    colecoes: ["essenciais"],
    resumo: "Jeans com etiqueta de couro e lavagem escura.",
    descricao:
      "Jaqueta jeans de lavagem escura uniforme, com etiqueta de couro rebitada na altura do peito. O denim é rígido no começo e amolda ao corpo com o uso, marcando as dobras de quem veste.\n\nComposição: 100% algodão denim 12 oz. Lavar do avesso, sem amaciante.",
    precoCentavos: 39900,
    cores: [AZUL, PRETO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 3, M: 5, G: 4, GG: 2 },
  },

  // ----------------------------------------------------------------- moletons
  {
    slug: "moletom-tommy-hilfiger-flag",
    nome: "Moletom Tommy Hilfiger Flag",
    marca: "Tommy Hilfiger",
    categoria: "moletons",
    colecoes: ["essenciais"],
    resumo: "Moletom flanelado com bandeira bordada no peito.",
    descricao:
      "Moletom de interior flanelado, com a bandeira bordada no peito e punho canelado duplo. A flanela é escovada dos dois lados, o que deixa a peça quente sem ficar pesada.\n\nComposição: 80% algodão, 20% poliéster. Lavar do avesso em água fria.",
    precoCentavos: 24900,
    destaque: true,
    cores: [AZUL, GRAFITE, OFF_WHITE],
    tamanhos: PMG,
    estoquePorTamanho: { P: 4, M: 7, G: 6, GG: 4 },
  },

  // ------------------------------------------------------------------ calças
  {
    slug: "calca-city-denim-86-black",
    nome: "Calça City Denim 86 Black",
    marca: "City Denim",
    categoria: "calcas",
    colecoes: ["essenciais"],
    resumo: "Jeans preto de lavagem uniforme, corte reto.",
    descricao:
      "Jeans preto com lavagem uniforme, sem desgaste aplicado, corte reto da coxa à barra. Cós médio com passantes largos, que aceitam cinto grosso sem forçar a costura.\n\nComposição: 98% algodão, 2% elastano. Lavar do avesso, em água fria.",
    precoCentavos: 24900,
    cores: [PRETO],
    tamanhos: NUMERICO,
    estoquePorTamanho: { "38": 3, "40": 6, "42": 7, "44": 5, "46": 3 },
  },
  {
    slug: "calca-city-denim-86-destroyed",
    nome: "Calça City Denim 86 Destroyed",
    marca: "City Denim",
    categoria: "calcas",
    colecoes: ["essenciais"],
    resumo: "Jeans com puídos no joelho e tela de reforço.",
    descricao:
      "Puídos feitos peça a peça, com tela interna nos joelhos para o rasgo não abrir com o uso. Lavagem média com leve sombreado na coxa, aplicada a laser — sem pedra, sem desgaste químico agressivo.\n\nComposição: 98% algodão, 2% elastano. Lavar do avesso, sem amaciante.",
    precoCentavos: 27900,
    lancamento: true,
    cores: [AZUL],
    tamanhos: NUMERICO,
    estoquePorTamanho: { "38": 2, "40": 5, "42": 6, "44": 4, "46": 2 },
  },

  // ---------------------------------------------------------------- bermudas
  {
    slug: "bermuda-linho-preta",
    nome: "Bermuda Linho Preta",
    marca: "KAUÃ STYLE",
    categoria: "bermudas",
    colecoes: ["verao-linho"],
    resumo: "Linho com cós elástico e cordão embutido.",
    descricao:
      "Linho misto com viscose: mantém a respirabilidade do linho puro e amassa bem menos. Cós com elástico interno e cordão embutido, dois bolsos faca e um traseiro com botão.\n\nComposição: 55% linho, 45% viscose. Lavar à mão, secar na sombra.",
    precoCentavos: 16900,
    cores: [PRETO],
    tamanhos: PMG,
    estoquePorTamanho: { P: 4, M: 8, G: 7, GG: 4 },
  },
  {
    slug: "bermuda-linho-off-white",
    nome: "Bermuda Linho Off White",
    marca: "KAUÃ STYLE",
    categoria: "bermudas",
    colecoes: ["verao-linho"],
    resumo: "Versão clara, tecido leve e caimento solto.",
    descricao:
      "Mesma modelagem da versão preta, em off white. O tecido claro é duplo na parte da frente, o que evita transparência mesmo sob sol forte — cuidado que costuma faltar em bermuda clara barata.\n\nComposição: 55% linho, 45% viscose. Lavar separado nas primeiras vezes.",
    precoCentavos: 16900,
    destaque: true,
    cores: [OFF_WHITE],
    tamanhos: PMG,
    estoquePorTamanho: { P: 4, M: 7, G: 6, GG: 3 },
  },

  // ------------------------------------------------------------------- bonés
  {
    slug: "bone-gucci-gg-preto",
    nome: "Boné Gucci GG Preto",
    marca: "Gucci",
    categoria: "bones",
    colecoes: ["acessorios"],
    resumo: "Aba curva, logo bordado e regulagem metálica.",
    descricao:
      "Boné de aba curva em sarja de algodão, logo bordado na frente e fecho metálico regulável. A aba tem miolo de papelão prensado, que segura a curva sem quebrar com o tempo.\n\nComposição: 100% algodão. Limpar com pano úmido.",
    precoCentavos: 12900,
    destaque: true,
    cores: [PRETO],
    tamanhos: UNICO,
    estoquePorTamanho: { "ÚNICO": 14 },
  },
  {
    slug: "bone-emporio-armani-1981",
    nome: "Boné Emporio Armani 1981",
    marca: "Emporio Armani",
    categoria: "bones",
    colecoes: ["acessorios"],
    resumo: "Bordado 1981 na frente, aba reta.",
    descricao:
      "Aba reta com bordado alto na frente e costura aparente nos gomos. Fita interna em algodão absorvente, trocável, que evita a mancha de suor na frente.\n\nComposição: 100% algodão. Lavar à mão.",
    precoCentavos: 11900,
    cores: [PRETO, AZUL],
    tamanhos: UNICO,
    estoquePorTamanho: { "ÚNICO": 11 },
  },
  {
    slug: "bone-burberry-check-bege",
    nome: "Boné Burberry Check Bege",
    marca: "Burberry",
    categoria: "bones",
    colecoes: ["acessorios"],
    resumo: "Xadrez clássico bege, aba curva.",
    descricao:
      "Xadrez tecido no próprio fio, não impresso — o desenho aparece igual nos dois lados do tecido. Aba curva e fecho de fivela em metal escovado.\n\nComposição: 100% algodão. Limpar com pano úmido.",
    precoCentavos: 12900,
    cores: [BEGE],
    tamanhos: UNICO,
    estoquePorTamanho: { "ÚNICO": 9 },
  },
  {
    slug: "bone-burberry-check-grafite",
    nome: "Boné Burberry Check Grafite",
    marca: "Burberry",
    categoria: "bones",
    colecoes: ["acessorios"],
    resumo: "Mesmo xadrez em tom grafite, aba curva.",
    descricao:
      "Versão em grafite do xadrez tecido, com contraste mais baixo — combina com look preto sem chamar tanta atenção quanto a versão bege.\n\nComposição: 100% algodão. Limpar com pano úmido.",
    precoCentavos: 12900,
    precoPromocionalCentavos: 9900,
    cores: [GRAFITE],
    tamanhos: UNICO,
    estoquePorTamanho: { "ÚNICO": 7 },
  },

  // ------------------------------------------------------------------ cintos
  {
    slug: "cinto-gucci-gg-web",
    nome: "Cinto Gucci GG Web",
    marca: "Gucci",
    categoria: "cintos",
    colecoes: ["acessorios"],
    resumo: "Fivela GG dourada e couro legítimo.",
    descricao:
      "Couro legítimo de 3,5 cm com fivela GG em metal dourado. O couro é curtido ao vegetal e escurece levemente com o uso, ganhando marca própria.\n\nComposição: couro bovino legítimo, fivela em liga metálica. Não molhar.",
    precoCentavos: 19900,
    destaque: true,
    cores: [PRETO, BEGE],
    tamanhos: CINTO,
    estoquePorTamanho: { "90": 5, "95": 7, "100": 4 },
  },
  {
    slug: "cinto-emporio-armani-aguia",
    nome: "Cinto Emporio Armani Águia",
    marca: "Emporio Armani",
    categoria: "cintos",
    colecoes: ["acessorios"],
    resumo: "Fivela com a águia gravada, couro fosco.",
    descricao:
      "Couro fosco de 3,5 cm com a águia gravada na fivela em metal escovado. Acabamento fosco marca menos e combina tanto com jeans quanto com alfaiataria.\n\nComposição: couro bovino legítimo. Limpar com pano seco.",
    precoCentavos: 17900,
    cores: [PRETO],
    tamanhos: CINTO,
    estoquePorTamanho: { "90": 4, "95": 6, "100": 3 },
  },
];

export function variantesDoProduto(p: DadoProduto): DadoVariante[] {
  const variantes: DadoVariante[] = [];
  for (const cor of p.cores) {
    for (const tamanho of p.tamanhos) {
      const base = p.estoquePorTamanho?.[tamanho] ?? 5;
      // Cores extras entram com estoque menor que a cor principal.
      const fator = p.cores.indexOf(cor) === 0 ? 1 : 0.6;
      variantes.push({
        tamanho,
        cor: cor.nome,
        corHex: cor.hex,
        estoque: Math.max(Math.round(base * fator), 0),
      });
    }
  }
  return variantes;
}

// Três letras por palavra do slug: "conjunto-casablanca-noir" vira CON-CAS-NOI.
export function sku(slug: string, cor: string, tamanho: string): string {
  const limpar = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
  const base = slug
    .split("-")
    .filter(Boolean)
    .map((p) => limpar(p).slice(0, 3))
    .join("");
  return `${base}-${limpar(cor).slice(0, 4)}-${limpar(tamanho)}`;
}
