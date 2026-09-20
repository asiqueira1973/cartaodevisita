// Toda a copy da interface, em português (spec 15).
//
// NENHUMA string de interface fica solta em componente (spec 18.1). A copy da
// seção 15 é LITERAL: não reescreva, não "melhore", não acrescente exclamação
// nem emoji. É decisão de produto, não de implementação.

/** Mensagens de erro e de estado (spec 15.2). O número é a linha da tabela. */
export const ERROS = {
  1: 'Esse endereço já está em uso. Tente outro.',
  2: 'O endereço pode ter letras, números e hífen, de 3 a 30 caracteres.',
  3: 'O endereço não pode começar nem terminar com hífen.',
  4: 'Você já tem um link de WhatsApp. Edite o que existe ou remova antes de adicionar outro.',
  5: 'Você já tem uma chave PIX. Edite a que existe ou remova antes de adicionar outra.',
  6: 'Um cartão pode ter até 15 links.',
  7: 'A imagem passa de 10 MB. Escolha uma menor.',
  8: 'Esse arquivo não é uma imagem JPEG ou PNG.',
  9: 'Não consegui preparar essa imagem. Tente outra.',
  10: 'A foto não subiu. Verifique a conexão e tente de novo.',
  11: 'Digite um telefone válido, com DDD.',
  12: 'Digite um e-mail válido.',
  13: 'Para publicar, preencha seu nome e adicione pelo menos um link.',
  14: 'Digite seu endereço para confirmar.',
  15: 'Não encontrei esse cartão.',
  16: 'Não consegui salvar. Tente de novo.',
  17: 'Seu plano permite até 5 links.',
  18: 'Esse visual está disponível em outro plano.',
} as const

/** Textos do produto (spec 15.4). */
export const TEXTOS = {
  homeTitulo: 'Seu contato na agenda de quem você acabou de conhecer.',
  homeSubtitulo:
    'Monte o seu em cinco minutos. Compartilhe por link, QR code ou etiqueta NFC. Do outro lado, ninguém precisa instalar nada.',
  homeBotao: 'Criar meu cartão',
  homeGarantia: 'Grátis, sem cartão',
  painelMeuCartao: 'Meu cartão',
  painelLinks: 'Links',
  painelAparencia: 'Aparência',
  painelCompartilhar: 'Compartilhar',
  painelAjustes: 'Ajustes',
  ajustesEndereco: 'Seu endereço',
  ajustesTrocarEndereco: 'Trocar endereço',
  ajustesConta: 'Conta',
  ajustesEntrandoCom: 'Entrando com',
  ajustesPlano: 'Plano',
  ajustesBusca: 'Aparecer em buscas',
  ajustesBuscaAjuda:
    'Com isso desligado, seu cartão não aparece no Google. O link continua funcionando para quem você mandar.',
  ajustesRisco: 'Zona de risco',
  ajustesSair: 'Sair desta conta',
  ajustesExcluir: 'Excluir minha conta',
  painelNoAr: 'No ar em',
  painelForaDoAr: 'Fora do ar',
  loginTitulo: 'Entre para montar seu cartão',
  loginBotao: 'Entrar com o Google',
  loginRodape: 'Sem senha para lembrar. Ao entrar, você concorda com os termos e a privacidade.',
  escolhaTitulo: 'Escolha seu endereço',
  escolhaAjuda:
    'É o link que você vai compartilhar. Dá para mudar depois, mas os links antigos param de funcionar.',
  cartaoSalvarContato: 'Salvar nos contatos',
  cartaoAcimaDoQr: 'Aponte a câmera',
  previaTarja: 'Só você está vendo. Publique para liberar o link.',
  publicar: 'Publicar cartão',
  despublicar: 'Tirar do ar',
  trocarHandleAviso:
    'Os links com o endereço antigo param de funcionar. Seu QR code e suas etiquetas NFC continuam funcionando.',
  excluirContaAviso:
    'Apaga seu cartão, sua foto e seus dados. Não dá para desfazer, e seu endereço fica livre para outra pessoa.',
  mensagemWhatsappPadrao: 'Olá! Vi seu cartão e gostaria de falar com você.',
  naoEncontradoTitulo: 'Não encontrei esse cartão.',
  naoEncontradoDetalhe: 'Ele pode ter sido removido ou o endereço mudou.',
} as const

/**
 * Bloco de instruções de NFC (spec 15.5).
 * Derivado LITERALMENTE da tabela de realidade 11.6. Não prometa nada além
 * disto — sobretudo, não sugira que encostar um celular no outro funciona.
 */
export const NFC = {
  titulo: 'Etiqueta NFC',
  paragrafo1:
    'Dá para gravar seu link numa etiqueta NFC e colar atrás do celular, na carteira ou num cartão de plástico. Quem encostar o celular na etiqueta abre seu cartão — sem app, no iPhone e no Android.',
  paragrafo2:
    'A gravação é feita fora daqui, por enquanto. Baixe o NFC Tools (grátis, iPhone e Android), escolha Gravar → URL e cole este endereço:',
  paragrafo3:
    'Use etiquetas NTAG215. Se for colar em metal ou atrás do celular, procure por etiqueta "on-metal", que tem uma camada de ferrite — sem ela o alcance cai muito.',
  permanencia:
    'Esse endereço nunca muda, mesmo que você troque seu endereço bonito. Pode travar a etiqueta como somente leitura sem medo.',
  naoFunciona:
    'Uma coisa que não funciona: encostar um celular no outro. Nem o iPhone nem o Android passam contato assim. A etiqueta física é o caminho.',
} as const

/** Rodapé da página pública, mostrado só no plano gratuito (spec 11.11.2). */
export const MARCA_RODAPE = 'Feito com Cartão de Visita'
