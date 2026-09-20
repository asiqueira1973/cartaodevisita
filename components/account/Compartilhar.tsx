'use client'

// Compartilhar: link, QR e etiqueta NFC (épico 8.5 e spec 10.2).
//
// O texto de NFC é LITERAL da seção 15.5, que por sua vez deriva da tabela de
// realidade 11.6. Não prometa nada além dele — sobretudo, não sugira que
// encostar um celular no outro funciona, porque não funciona.

import { useState } from 'react'
import { NFC, TEXTOS } from '@/lib/copy'

export function Compartilhar({
  handle, urlBase, urlPermanente, qrSvg, publicado,
}: {
  handle: string
  urlBase: string
  urlPermanente: string
  qrSvg: string
  publicado: boolean
}) {
  const [copiado, setCopiado] = useState<'link' | 'nfc' | null>(null)
  const linkBonito = `${urlBase}/${handle}`

  async function copiar(texto: string, qual: 'link' | 'nfc', evento: string) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(qual)
      setTimeout(() => setCopiado(null), 2000)
    } catch {
      // Sem área de transferência, o texto na tela continua selecionável.
    }
    // A telemetria sai do servidor (regra 21.3.1). Falha em silêncio.
    void fetch('/api/conta/eventos', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: evento }),
    }).catch(() => {})
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {!publicado && (
        <div className="flex items-start gap-3 rounded-xl border border-traco px-4 py-3.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" className="mt-px shrink-0">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
          </svg>
          <p className="text-[13px] leading-relaxed text-tinta-fraca">
            Seu cartão está <strong className="text-tinta">fora do ar</strong>. O link e o QR
            existem, mas quem abrir vai ver uma página de erro até você publicar.
          </p>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-tinta">Seu link</h2>
        <div className="flex gap-2">
          <div className="flex min-h-11.5 grow items-center overflow-hidden rounded-xl border border-traco bg-superficie-2 px-3.5 text-[14px] whitespace-nowrap text-tinta">
            {linkBonito}
          </div>
          <button type="button" aria-label="Copiar link"
            onClick={() => void copiar(`https://${linkBonito}`, 'link', 'link_copiado')}
            className="flex h-11.5 w-11.5 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-tinta text-white">
            {copiado === 'link' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></svg>
            )}
          </button>
        </div>
        <a href={`https://wa.me/?text=${encodeURIComponent(`https://${linkBonito}`)}`}
          target="_blank" rel="noreferrer"
          className="flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-tinta text-[15px] font-semibold text-white">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
          </svg>
          Enviar por WhatsApp
        </a>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-tinta">QR code</h2>
        <div className="flex items-center gap-4 rounded-xl border border-traco p-4">
          <span className="block w-24 shrink-0 rounded-lg border border-traco p-1.5 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <div className="flex grow flex-col gap-2.5">
            <p className="text-[13px] leading-relaxed text-tinta-fraca">
              Para imprimir em cartão, adesivo ou vitrine. Ele aponta para o seu
              endereço permanente — nunca quebra, mesmo se você trocar o endereço.
            </p>
            <a href={`/api/cartoes/${handle}/qr.png`} download
              onClick={() => void fetch('/api/conta/eventos', {
                method: 'POST', headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ nome: 'qr_baixado' }),
              }).catch(() => {})}
              className="flex min-h-9.5 w-fit items-center rounded-full border border-traco-forte px-4 text-[13px] font-semibold text-tinta">
              Baixar PNG
            </a>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-tinta">{NFC.titulo}</h2>
        <div className="flex flex-col gap-3.5 rounded-xl border border-traco p-4">
          <p className="text-[13px] leading-relaxed text-tinta-media">{NFC.paragrafo1}</p>
          <p className="text-[13px] leading-relaxed text-tinta-media">{NFC.paragrafo2}</p>

          <div className="flex gap-2">
            <div className="flex min-h-10.5 grow items-center overflow-hidden rounded-lg border border-traco bg-superficie-2 px-3 font-mono text-[12px] whitespace-nowrap text-tinta">
              {urlPermanente}
            </div>
            <button type="button"
              onClick={() => void copiar(urlPermanente, 'nfc', 'endereco_nfc_copiado')}
              className="min-h-10.5 shrink-0 cursor-pointer rounded-full border border-traco-forte px-4 text-[13px] font-semibold text-tinta">
              {copiado === 'nfc' ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <p className="text-[13px] leading-relaxed text-tinta-media">{NFC.paragrafo3}</p>

          <div className="flex gap-2.5 rounded-lg bg-superficie-2 px-3.5 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="mt-px shrink-0">
              <path d="M12 3l9 16H3z" /><path d="M12 9v5M12 17h.01" />
            </svg>
            <p className="text-xs leading-relaxed text-tinta-media">{NFC.permanencia}</p>
          </div>

          <div className="h-px bg-traco" />
          <p className="text-[13px] leading-relaxed text-tinta-fraca">{NFC.naoFunciona}</p>
        </div>
      </section>

      <p className="text-xs text-tinta-apagada">
        Prévia do cartão: <a href={`/${handle}`} target="_blank" rel="noreferrer" className="font-semibold text-tinta underline underline-offset-2">{TEXTOS.painelMeuCartao.toLowerCase()} em {linkBonito}</a>
      </p>
    </div>
  )
}
