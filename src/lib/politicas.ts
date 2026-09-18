export type Politica = {
  slug: string;
  titulo: string;
  resumo: string;
  secoes: { titulo: string; paragrafos: string[] }[];
};

export const POLITICAS: Politica[] = [
  {
    slug: "trocas-e-devolucoes",
    titulo: "Trocas e devoluções",
    resumo: "Sete dias para arrependimento e trinta dias para defeito de fabricação.",
    secoes: [
      {
        titulo: "Arrependimento",
        paragrafos: [
          "Você tem 7 dias corridos a partir do recebimento para desistir da compra, conforme o artigo 49 do Código de Defesa do Consumidor.",
          "A peça precisa voltar sem uso, com etiqueta e na embalagem original. O valor pago é devolvido integralmente, incluindo o frete.",
        ],
      },
      {
        titulo: "Troca de tamanho",
        paragrafos: [
          "A primeira troca de tamanho é por nossa conta: enviamos o código de postagem e reenviamos a peça nova assim que a original chegar.",
          "A troca depende de estoque do tamanho desejado. Sem estoque, você escolhe outra peça ou recebe o valor de volta.",
        ],
      },
      {
        titulo: "Defeito de fabricação",
        paragrafos: [
          "Prazo de 30 dias para relatar defeito. Peça fotos pelo WhatsApp e resolvemos troca ou reembolso sem custo de frete.",
        ],
      },
      {
        titulo: "Como solicitar",
        paragrafos: [
          "Fale com a gente pelo WhatsApp informando o número do pedido. Respondemos em até 1 dia útil com as instruções de postagem.",
        ],
      },
    ],
  },
  {
    slug: "entrega",
    titulo: "Prazos e entrega",
    resumo: "Envio em até 2 dias úteis após a confirmação do pagamento.",
    secoes: [
      {
        titulo: "Postagem",
        paragrafos: [
          "Pedidos pagos até 14h em dia útil são separados no mesmo dia. Os demais saem no dia útil seguinte.",
          "O prazo de entrega começa a contar da postagem, não da compra.",
        ],
      },
      {
        titulo: "Acompanhamento",
        paragrafos: [
          "Assim que a etiqueta é gerada, o código de rastreio aparece na página do pedido e também é enviado por e-mail.",
        ],
      },
      {
        titulo: "Endereço incorreto",
        paragrafos: [
          "Endereço incompleto ou incorreto pode devolver a encomenda. Nesse caso combinamos o reenvio, com novo frete a combinar.",
        ],
      },
    ],
  },
  {
    slug: "pagamento",
    titulo: "Formas de pagamento",
    resumo: "Pix, cartão e boleto pelo Mercado Pago. Nenhum dado de cartão passa pela loja.",
    secoes: [
      {
        titulo: "Onde o pagamento acontece",
        paragrafos: [
          "O pagamento é processado pelo Mercado Pago. Você digita os dados no ambiente deles; a loja recebe de volta apenas o identificador e o status da transação.",
          "Não armazenamos número de cartão, CVV ou validade em nenhum momento.",
        ],
      },
      {
        titulo: "Confirmação",
        paragrafos: [
          "O pedido só muda para pago quando o próprio gateway confirma o recebimento, e ainda conferimos se o valor pago bate com o total do pedido.",
          "Pix costuma confirmar em segundos; boleto pode levar até 3 dias úteis.",
        ],
      },
    ],
  },
  {
    slug: "privacidade",
    titulo: "Privacidade",
    resumo: "Usamos seus dados para entregar o pedido e dar suporte. Nada é vendido a terceiros.",
    secoes: [
      {
        titulo: "O que guardamos",
        paragrafos: [
          "Nome, e-mail, telefone, CPF e endereço de entrega — o mínimo para emitir e entregar o pedido.",
          "A senha é guardada apenas como hash bcrypt. Nem a equipe da loja consegue lê-la.",
        ],
      },
      {
        titulo: "Com quem compartilhamos",
        paragrafos: [
          "Com o Mercado Pago, para processar o pagamento, e com os Correios, para entregar. Nada além disso.",
        ],
      },
      {
        titulo: "Seus direitos",
        paragrafos: [
          "Você pode pedir a correção ou a exclusão dos seus dados a qualquer momento pelo WhatsApp ou pelo formulário de suporte.",
        ],
      },
    ],
  },
];

export function politicaPorSlug(slug: string): Politica | undefined {
  return POLITICAS.find((p) => p.slug === slug);
}

export const FAQ = [
  {
    pergunta: "Como sei qual tamanho comprar?",
    resposta:
      "Cada peça tem a tabela de medidas na página do produto e há um guia completo em /guia-de-tamanhos. Na dúvida entre dois tamanhos, o maior costuma cair melhor nas peças de alfaiataria.",
  },
  {
    pergunta: "Em quanto tempo chega?",
    resposta:
      "O envio sai em até 2 dias úteis após a confirmação do pagamento. O prazo dos Correios aparece no carrinho assim que você informa o CEP.",
  },
  {
    pergunta: "O frete é grátis?",
    resposta: "Sim, para compras acima de R$ 399,00 na entrega padrão, para todo o Brasil.",
  },
  {
    pergunta: "Posso trocar o tamanho?",
    resposta:
      "Pode. A primeira troca de tamanho é por nossa conta, dentro de 7 dias do recebimento e com a peça sem uso.",
  },
  {
    pergunta: "Quais são as formas de pagamento?",
    resposta:
      "Pix, cartão de crédito e boleto, processados pelo Mercado Pago. Também combinamos Pix direto pelo WhatsApp quando você preferir.",
  },
  {
    pergunta: "As peças são originais?",
    resposta:
      "Trabalhamos com peças inspiradas nas grifes que você vê nos looks. A descrição de cada produto traz a composição e o acabamento reais da peça.",
  },
  {
    pergunta: "Como acompanho meu pedido?",
    resposta:
      "Pela página /rastreio com o número do pedido e o e-mail usado na compra, ou pela sua conta em /conta/pedidos.",
  },
];
