// Normalização por tipo de link (spec 11.5) e recusa de esquema (spec 20.5).
import { describe, expect, it } from 'vitest'
import { LinkInvalidoError, buildLinkUrl, normalizeLinkValue, normalizeUrl } from '@/lib/links'

describe('telefone (regra 11.5)', () => {
  it('aceita as três formas da tabela e guarda E.164', () => {
    for (const entrada of ['(11) 98765-4321', '11987654321', '+5511987654321']) {
      expect(normalizeLinkValue('whatsapp', entrada)).toBe('+5511987654321')
    }
  })
  it('NÃO insere o nono dígito em fixo de 8 — inserir quebraria o número', () => {
    expect(normalizeLinkValue('telefone', '(21) 2555-1234')).toBe('+552125551234')
  })
  it('recusa telefone curto demais', () => {
    expect(() => normalizeLinkValue('whatsapp', '1234')).toThrow(LinkInvalidoError)
  })
})

describe('usuário de rede (regra 11.5)', () => {
  it('guarda só o usuário, nas três formas', () => {
    for (const entrada of ['@fulano', 'fulano', 'instagram.com/fulano', 'https://instagram.com/fulano']) {
      expect(normalizeLinkValue('instagram', entrada)).toBe('fulano')
    }
  })
  it('entende a URL do LinkedIn com /in/', () => {
    expect(normalizeLinkValue('linkedin', 'https://linkedin.com/in/fulano')).toBe('fulano')
  })
})

describe('e-mail, PIX e endereço (regra 11.5)', () => {
  it('baixa a caixa do e-mail', () => {
    expect(normalizeLinkValue('email', '  Daniela@Exemplo.COM.br ')).toBe('daniela@exemplo.com.br')
  })
  it('guarda a chave PIX como digitada, só aparando as pontas', () => {
    expect(normalizeLinkValue('pix', '  daniela@exemplo.com.br  ')).toBe('daniela@exemplo.com.br')
    expect(normalizeLinkValue('pix', '123.456.789-00')).toBe('123.456.789-00')
  })
  it('recusa endereço acima de 120 caracteres', () => {
    expect(() => normalizeLinkValue('endereco', 'a'.repeat(121))).toThrow(LinkInvalidoError)
  })
})

describe('esquema de URL (spec 20.5) — a porta de entrada de XSS', () => {
  it('força https quando falta esquema', () => {
    expect(normalizeUrl('exemplo.com.br')).toBe('https://exemplo.com.br/')
  })
  it('recusa javascript:, data: e file:', () => {
    for (const perigoso of ['javascript:alert(1)', 'data:text/html,<script>', 'file:///etc/passwd']) {
      expect(() => normalizeUrl(perigoso)).toThrow(LinkInvalidoError)
    }
  })
  it('recusa host sem ponto', () => {
    expect(() => normalizeUrl('https://localhost')).toThrow(LinkInvalidoError)
  })
})

describe('montagem da URL final (regra 11.5)', () => {
  it('monta o wa.me sem o + e com a mensagem', () => {
    expect(buildLinkUrl('whatsapp', '+5511987654321', 'Oi!'))
      .toBe('https://wa.me/5511987654321?text=Oi!')
  })
  it('usa a mensagem padrão quando não há uma', () => {
    expect(buildLinkUrl('whatsapp', '+5511987654321')).toContain('Ol%C3%A1!%20Vi%20seu%20cart%C3%A3o')
  })
  it('PIX não abre link — é botão de copiar', () => {
    expect(buildLinkUrl('pix', 'daniela@exemplo.com.br')).toBeNull()
  })
})
