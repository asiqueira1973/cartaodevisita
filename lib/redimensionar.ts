// Redimensionamento da foto NO NAVEGADOR (assunção 24.12, critério 8.2.4).
//
// O servidor só valida (spec 13.1). Fazer aqui mantém a rota barata e evita
// processar imagem em função serverless.
//
// Este módulo só roda no cliente: usa canvas e createImageBitmap.

import { TETO_VCARD_BYTES } from '@/lib/imagens'

/** Lado da derivada de exibição, em pixels (spec 7.5). */
export const LADO_EXIBICAO = 600

/** Lado da derivada do vCard (tabela 14.2). */
export const LADO_VCARD = 300

/**
 * Recorta no centro e desenha num quadrado do lado pedido.
 * O recorte é "cover": preenche o quadrado inteiro e corta o excesso do lado
 * mais longo, que é o que se espera de uma foto de perfil.
 */
function desenharQuadrado(fonte: ImageBitmap, lado: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = lado
  canvas.height = lado

  const contexto = canvas.getContext('2d')
  if (!contexto) throw new Error('canvas indisponível')

  const menorLado = Math.min(fonte.width, fonte.height)
  const origemX = (fonte.width - menorLado) / 2
  const origemY = (fonte.height - menorLado) / 2

  contexto.imageSmoothingQuality = 'high'
  contexto.drawImage(fonte, origemX, origemY, menorLado, menorLado, 0, 0, lado, lado)
  return canvas
}

/** Converte o canvas em JPEG, na qualidade pedida. */
function paraJpeg(canvas: HTMLCanvasElement, qualidade: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('falha ao converter'))),
      'image/jpeg',
      qualidade,
    )
  })
}

/**
 * Comprime até caber no teto, baixando a qualidade por degraus (tabela 14.2).
 * Devolve o menor que conseguiu; se nem na qualidade mínima couber, devolve o
 * último e deixa o servidor recusar — falhar no servidor é melhor que gravar
 * um arquivo que quebra o .vcf de quem recebe o cartão.
 */
async function comprimirAte(canvas: HTMLCanvasElement, tetoBytes: number): Promise<Blob> {
  let ultimo: Blob | null = null
  for (const qualidade of [0.85, 0.75, 0.65, 0.55, 0.45, 0.35]) {
    ultimo = await paraJpeg(canvas, qualidade)
    if (ultimo.size <= tetoBytes) return ultimo
  }
  return ultimo as Blob
}

/**
 * Gera as DUAS derivadas a partir do arquivo escolhido (critério 8.2.3).
 *
 * As duas saem juntas, de propósito (máquina de estado 12.3): gerar só a de
 * exibição deixaria o cartão com foto na tela e sem foto no .vcf, e ninguém
 * entenderia por quê.
 */
export async function gerarDerivadas(arquivo: File): Promise<{ exibicao: Blob; vcard: Blob }> {
  const bitmap = await createImageBitmap(arquivo)
  try {
    const exibicao = await paraJpeg(desenharQuadrado(bitmap, LADO_EXIBICAO), 0.85)
    const vcard = await comprimirAte(desenharQuadrado(bitmap, LADO_VCARD), TETO_VCARD_BYTES)
    return { exibicao, vcard }
  } finally {
    bitmap.close()
  }
}
