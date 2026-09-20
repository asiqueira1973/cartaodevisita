// QR code (épico 8.5). O que importa aqui é O QUE vai dentro do código.
import { describe, expect, it } from 'vitest'
import { nomeDoArquivoQr, qrComoPng, qrComoSvg, urlDoQr } from '@/lib/qr'

const BASE = 'https://cartaodevisita.app.br'

describe('pegadinha 18.4.4 — o QR codifica o endereço PERMANENTE', () => {
  it('monta /c/<id>, nunca o handle', () => {
    expect(urlDoQr('tcdhebzs', BASE)).toBe('https://cartaodevisita.app.br/c/tcdhebzs')
  })
  it('a URL gerada não contém nada parecido com handle', () => {
    // Se alguém trocar a assinatura para receber handle, este teste cai junto.
    expect(urlDoQr('tcdhebzs', BASE)).not.toContain('alexandresiqueira')
  })
  it('tolera barra sobrando na base', () => {
    expect(urlDoQr('tcdhebzs', `${BASE}/`)).toBe(`${BASE}/c/tcdhebzs`)
  })
})

describe('formato do código (critério 8.5.3)', () => {
  it('o SVG contém a URL codificada e não tem largura fixa', async () => {
    const svg = await qrComoSvg('tcdhebzs', BASE)
    expect(svg).toContain('<svg')
    expect(svg).toContain('viewBox')
  })
  it('o PNG sai com a assinatura correta e 1024 px', async () => {
    const png = await qrComoPng('tcdhebzs', BASE)
    // Magic bytes de PNG.
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    // Largura e altura ficam nos bytes 16..24 do cabeçalho IHDR.
    expect(png.readUInt32BE(16)).toBe(1024)
    expect(png.readUInt32BE(20)).toBe(1024)
  })
})

describe('nome do arquivo (critério 8.5.6)', () => {
  it('usa o handle', () => {
    expect(nomeDoArquivoQr('alexandresiqueira')).toBe('qr-alexandresiqueira.png')
  })
})
