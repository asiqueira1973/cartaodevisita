'use client'

// Download do QR com o endereço escrito dentro da imagem (épico 8.5).
//
// POR QUE NÃO É SÓ O QR: quem tem mais de um cartão — contas Google diferentes,
// pessoal e empresa — acaba com vários PNGs na galeria, e um QR é visualmente
// idêntico ao outro. Sem o endereço na imagem, não há como saber qual é qual
// sem escanear um por um.
//
// A composição é feita NO NAVEGADOR, com canvas. No servidor precisaria de um
// rasterizador de fonte — dependência nativa pesada para desenhar uma linha de
// texto. O canvas já tem tipografia de verdade e não custa nada.
//
// Degrada: sem canvas, o link cai no PNG do servidor, que é o QR puro. Pior,
// mas funciona.

import { useState } from 'react'
import { nomeDoArquivoQr } from '@/lib/qr'

/** Lado do QR no arquivo final (critério 8.5.6). */
const LADO_QR = 1024

/** Altura da faixa de texto acima do código. */
const ALTURA_TEXTO = 190

export function BaixarQr({ handle, urlBase }: { handle: string; urlBase: string }) {
  const [gerando, setGerando] = useState(false)

  async function baixar(evento: React.MouseEvent<HTMLAnchorElement>) {
    // Só intercepta se der para compor; senão deixa o link fazer o trabalho.
    const canvas = document.createElement('canvas')
    const contexto = canvas.getContext('2d')
    if (!contexto) return

    evento.preventDefault()
    setGerando(true)
    try {
      const resposta = await fetch(`/api/cartoes/${handle}/qr.png`)
      const bitmap = await createImageBitmap(await resposta.blob())

      canvas.width = LADO_QR
      canvas.height = LADO_QR + ALTURA_TEXTO

      contexto.fillStyle = '#FFFFFF'
      contexto.fillRect(0, 0, canvas.width, canvas.height)

      // O endereço vai ACIMA do código, como na tela cheia.
      contexto.fillStyle = '#18181B'
      contexto.textAlign = 'center'
      contexto.textBaseline = 'alphabetic'

      contexto.font = '600 40px "Plus Jakarta Sans", system-ui, sans-serif'
      contexto.fillText(`${urlBase}/`, LADO_QR / 2, 80)

      contexto.font = '700 62px "Plus Jakarta Sans", system-ui, sans-serif'
      contexto.fillText(handle, LADO_QR / 2, 148)

      contexto.drawImage(bitmap, 0, ALTURA_TEXTO, LADO_QR, LADO_QR)
      bitmap.close()

      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
      if (!blob) throw new Error('canvas não gerou o arquivo')

      const url = URL.createObjectURL(blob)
      const elo = document.createElement('a')
      elo.href = url
      elo.download = nomeDoArquivoQr(handle)
      elo.click()
      URL.revokeObjectURL(url)

      void fetch('/api/conta/eventos', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nome: 'qr_baixado' }),
      }).catch(() => {})
    } catch {
      // Compor falhou: abre o PNG do servidor, sem o texto.
      window.location.href = `/api/cartoes/${handle}/qr.png`
    } finally {
      setGerando(false)
    }
  }

  return (
    <a
      href={`/api/cartoes/${handle}/qr.png`}
      download
      onClick={(e) => void baixar(e)}
      className="flex min-h-9.5 w-fit cursor-pointer items-center rounded-full border border-traco-forte px-4 text-[13px] font-semibold text-tinta"
    >
      {gerando ? 'Gerando…' : 'Baixar PNG'}
    </a>
  )
}
