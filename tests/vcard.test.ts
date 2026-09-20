// Formato do .vcf (spec 14.2) — a parte mais frágil do produto.
import { describe, expect, it } from 'vitest'
import { buildVCard, escapeVCardText, foldLine, splitName, vcardFileName } from '@/lib/vcard'
import type { Cartao } from '@/types/dominio'

const cartaoBase: Cartao = {
  id: 'u1', usuario_id: 'u1',
  nome_exibicao: 'Daniela Saboya',
  cargo: 'Psicanalista', empresa: null,
  bio: 'Atendimento online e presencial na Zona Sul.',
  foto_url: null, foto_vcard_url: null,
  links: [
    { id: 'l1', tipo: 'whatsapp', valor: '+5521998765432', rotulo: null, ordem: 0 },
    { id: 'l2', tipo: 'instagram', valor: 'danielasaboya', rotulo: null, ordem: 1 },
    { id: 'l3', tipo: 'email', valor: 'daniela@exemplo.com.br', rotulo: null, ordem: 2 },
    { id: 'l4', tipo: 'pix', valor: 'daniela@exemplo.com.br', rotulo: null, ordem: 3 },
  ],
  template: 'minimalista', cor_destaque: 'roxo',
  publicado: true, permitir_indexacao: false, mensagem_whatsapp: null,
  atualizado_em: new Date('2026-09-20T12:00:00Z'),
}

const gerar = (c: Partial<Cartao> = {}, fotoBase64: string | null = null) =>
  buildVCard({ cartao: { ...cartaoBase, ...c }, handle: 'danielasaboya', urlBase: 'https://cartaodevisita.app.br', fotoBase64 })

describe('quebra de linha e envelope (tabela 14.2)', () => {
  it('usa CRLF, nunca LF puro', () => {
    const vcf = gerar()
    expect(vcf).toContain('\r\n')
    expect(vcf.replace(/\r\n/g, '')).not.toContain('\n')
  })
  it('abre e fecha o cartão na versão 3.0', () => {
    const vcf = gerar()
    expect(vcf.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true)
    expect(vcf.endsWith('END:VCARD\r\n')).toBe(true)
  })
})

describe('dobra em 75 OCTETOS (tabela 14.2)', () => {
  it('não mexe em linha curta', () => {
    expect(foldLine('FN:Daniela')).toBe('FN:Daniela')
  })
  it('dobra a linha da foto e continua com um espaço', () => {
    const linhas = foldLine(`PHOTO;ENCODING=b;TYPE=JPEG:${'A'.repeat(400)}`).split('\r\n')
    expect(linhas.length).toBeGreaterThan(1)
    for (const l of linhas.slice(1)) expect(l.startsWith(' ')).toBe(true)
  })
  it('conta OCTETOS, não caracteres — acento ocupa 2 bytes', () => {
    const enc = new TextEncoder()
    for (const l of foldLine(`NOTE:${'é'.repeat(80)}`).split('\r\n')) {
      expect(enc.encode(l).length).toBeLessThanOrEqual(75)
    }
  })
  it('nunca corta no meio de um caractere multibyte', () => {
    const dobrada = foldLine(`NOTE:${'çãé'.repeat(60)}`)
    // Se cortasse no meio de uma sequência UTF-8, apareceria U+FFFD ao decodificar.
    expect(dobrada).not.toContain('�')
  })
})

describe('escape de texto livre (tabela 14.2)', () => {
  it('escapa contrabarra, ponto e vírgula, vírgula e quebra', () => {
    expect(escapeVCardText('a\\b;c,d\ne')).toBe('a\\\\b\;c\\,d\\ne')
  })
  it('bio com vírgula sai escapada no arquivo', () => {
    expect(gerar({ bio: 'Atendo adultos, adolescentes e casais.' }))
      .toContain('NOTE:Atendo adultos\\, adolescentes e casais.')
  })
})

describe('mapeamento de campos (tabela 14.1)', () => {
  it('quebra o nome no último espaço', () => {
    expect(splitName('Daniela Saboya')).toEqual({ nome: 'Daniela', sobrenome: 'Saboya' })
    expect(splitName('Maria da Silva Costa')).toEqual({ nome: 'Maria da Silva', sobrenome: 'Costa' })
  })
  it('nome de uma palavra fica com sobrenome vazio (caso 22.3)', () => {
    expect(splitName('Madonna')).toEqual({ nome: 'Madonna', sobrenome: '' })
  })
  it('leva WhatsApp como CELL e e-mail como INTERNET', () => {
    const vcf = gerar()
    expect(vcf).toContain('TEL;TYPE=CELL,VOICE:+5521998765432')
    expect(vcf).toContain('EMAIL;TYPE=INTERNET:daniela@exemplo.com.br')
  })
  it('leva a URL do próprio cartão', () => {
    expect(gerar()).toContain('URL:https://cartaodevisita.app.br/danielasaboya')
  })
  it('NÃO leva a chave PIX — não há propriedade vCard para ela (spec 14.1)', () => {
    const vcf = gerar()
    const linhasPix = vcf.split('\r\n').filter((l) => /pix/i.test(l))
    expect(linhasPix).toHaveLength(0)
  })
  it('omite ORG quando não há empresa, em vez de mandar vazia', () => {
    expect(gerar()).not.toContain('ORG:')
  })
})

describe('foto (critério 8.6.5)', () => {
  it('sai SEM a propriedade PHOTO quando não há foto', () => {
    expect(gerar()).not.toContain('PHOTO')
  })
  it('embute em base64 quando há foto', () => {
    expect(gerar({}, 'QUJD')).toContain('PHOTO;ENCODING=b;TYPE=JPEG:QUJD')
  })
})

describe('nome do arquivo (spec 14.3)', () => {
  it('normaliza acento e espaço', () => {
    expect(vcardFileName('Daniela Saboya', 'x')).toBe('daniela-saboya.vcf')
    expect(vcardFileName('José Antônio', 'x')).toBe('jose-antonio.vcf')
  })
  it('cai no handle quando a normalização esvazia', () => {
    expect(vcardFileName('...', 'danielasaboya')).toBe('danielasaboya.vcf')
  })
})

describe('REGRESSÃO — data vinda do cache chega como string', () => {
  it('buildVCard falha alto se receber string em vez de Date', () => {
    // O cache do Next serializa em JSON e transforma Date em string ISO. O
    // conserto é reviver na fronteira (lib/cache.ts), e este teste existe para
    // que ninguém "resolva" fazendo buildVCard aceitar os dois tipos — isso
    // espalharia o problema pelo código inteiro em vez de consertá-lo.
    const comStringNoLugarDeData = {
      ...cartaoBase,
      atualizado_em: '2026-09-20T12:00:00.000Z' as unknown as Date,
    }
    expect(() => buildVCard({
      cartao: comStringNoLugarDeData, handle: 'x',
      urlBase: 'https://exemplo.com', fotoBase64: null,
    })).toThrow(TypeError)
  })

  it('com Date de verdade, o REV sai em ISO sem milissegundos', () => {
    expect(gerar()).toContain('REV:2026-09-20T12:00:00Z')
  })
})
