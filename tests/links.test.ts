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
    expect(normalizeLinkValue('email', '  Helena@Exemplo.COM.br ')).toBe('helena@exemplo.com.br')
  })
  it('guarda a chave PIX como digitada, só aparando as pontas', () => {
    expect(normalizeLinkValue('pix', '  helena@exemplo.com.br  ')).toBe('helena@exemplo.com.br')
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
    expect(buildLinkUrl('pix', 'helena@exemplo.com.br')).toBeNull()
  })
})

// ---------------------------------------------------------------------------

import { renumerar, validarListaDeLinks } from '@/lib/links'
import type { LinkCartao } from '@/types/dominio'

const link = (tipo: LinkCartao['tipo'], i = 0): LinkCartao =>
  ({ id: `l${i}`, tipo, valor: 'x', rotulo: null, ordem: i })

describe('validação da lista (regra 11.4)', () => {
  it('aceita a lista vazia e o teto do plano', () => {
    expect(validarListaDeLinks([], 5)).toBeNull()
    expect(validarListaDeLinks(Array.from({ length: 5 }, (_, i) => link('site', i)), 5)).toBeNull()
  })
  it('recusa o 6º link no plano gratuito', () => {
    const seis = Array.from({ length: 6 }, (_, i) => link('site', i))
    expect(validarListaDeLinks(seis, 5)).toBe('acima_do_plano')
  })
  it('recusa o 16º em QUALQUER plano — o teto absoluto vem primeiro', () => {
    const dezesseis = Array.from({ length: 16 }, (_, i) => link('site', i))
    expect(validarListaDeLinks(dezesseis, 15)).toBe('acima_do_teto')
    // Mesmo com um teto de plano absurdo, o absoluto continua valendo.
    expect(validarListaDeLinks(dezesseis, 999)).toBe('acima_do_teto')
  })
  it('recusa dois WhatsApp e dois PIX, com erros distintos', () => {
    expect(validarListaDeLinks([link('whatsapp', 0), link('whatsapp', 1)], 15)).toBe('whatsapp_duplicado')
    expect(validarListaDeLinks([link('pix', 0), link('pix', 1)], 15)).toBe('pix_duplicado')
  })
  it('aceita vários links de tipos que não são únicos', () => {
    expect(validarListaDeLinks([link('site', 0), link('site', 1), link('outro', 2)], 15)).toBeNull()
  })
  it('recusa tipo desconhecido e rótulo acima de 24', () => {
    expect(validarListaDeLinks([{ ...link('site'), tipo: 'orkut' as never }], 15)).toBe('tipo_invalido')
    expect(validarListaDeLinks([{ ...link('site'), rotulo: 'a'.repeat(25) }], 15)).toBe('rotulo_longo')
  })
})

describe('renumeração (critério 8.3.5)', () => {
  it('a ordem gravada segue a posição no array, não o campo que veio', () => {
    const bagunçados: LinkCartao[] = [
      { ...link('site', 0), ordem: 9 },
      { ...link('email', 1), ordem: 3 },
      { ...link('pix', 2), ordem: 7 },
    ]
    expect(renumerar(bagunçados).map((l) => l.ordem)).toEqual([0, 1, 2])
  })
})
