// Limites dos campos do cartão (regra 11.4) e validação de imagem (spec 20.5).
import { describe, expect, it } from 'vitest'
import { LIMITES, deveMostrarContador, iniciais, paraGravar, validarCampo } from '@/lib/cartao'
import { TETO_VCARD_BYTES, detectarTipoDeImagem, validarDerivada } from '@/lib/imagens'

describe('limites de texto (regra 11.4)', () => {
  it('usa exatamente os números do spec', () => {
    expect(LIMITES).toEqual({
      nome_exibicao: 60, cargo: 60, empresa: 60,
      bio: 160, mensagem_whatsapp: 120, rotulo: 24,
    })
  })
  it('aceita o limite exato e recusa um caractere a mais', () => {
    expect(validarCampo('bio', 'a'.repeat(160))).toBeNull()
    expect(validarCampo('bio', 'a'.repeat(161))).toBe('longo')
  })
  it('nome é o único obrigatório', () => {
    expect(validarCampo('nome_exibicao', '   ')).toBe('obrigatorio')
    expect(validarCampo('cargo', '')).toBeNull()
  })
})

describe('contador de caracteres (critério 8.2.2)', () => {
  it('aparece a partir de 80% do limite', () => {
    expect(deveMostrarContador('bio', 'a'.repeat(127))).toBe(false)
    expect(deveMostrarContador('bio', 'a'.repeat(128))).toBe(true)
  })
})

describe('campo opcional vazio vira nulo (spec 7.5)', () => {
  it('distingue "não preenchi" de string vazia', () => {
    expect(paraGravar('')).toBeNull()
    expect(paraGravar('   ')).toBeNull()
    expect(paraGravar(undefined)).toBeNull()
    expect(paraGravar('  Psicanalista ')).toBe('Psicanalista')
  })
})

describe('iniciais do cartão sem foto (critério 8.2.8)', () => {
  it('usa primeira e última palavra', () => {
    expect(iniciais('Helena Prado')).toBe('HP')
    expect(iniciais('Maria da Silva Costa')).toBe('MC')
  })
  it('nome de uma palavra usa só a primeira letra', () => {
    expect(iniciais('Madonna')).toBe('M')
  })
  it('respeita acento', () => {
    expect(iniciais('Ângela Ávila')).toBe('ÂÁ')
  })
})

describe('magic bytes (critério 8.2.5) — a porta de entrada no Storage', () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])

  it('reconhece JPEG e PNG', () => {
    expect(detectarTipoDeImagem(jpeg)).toBe('jpeg')
    expect(detectarTipoDeImagem(png)).toBe('png')
  })
  it('recusa SVG mesmo com nome de .jpg — é isso que a checagem existe para pegar', () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>')
    expect(detectarTipoDeImagem(svg)).toBeNull()
    expect(validarDerivada(svg, TETO_VCARD_BYTES)).toBe('formato')
  })
  it('recusa arquivo vazio e lixo', () => {
    expect(detectarTipoDeImagem(new Uint8Array([]))).toBeNull()
    expect(detectarTipoDeImagem(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]))).toBeNull()
  })
  it('recusa imagem válida acima do teto', () => {
    const grande = new Uint8Array(TETO_VCARD_BYTES + 1)
    grande.set([0xff, 0xd8, 0xff])
    expect(validarDerivada(grande, TETO_VCARD_BYTES)).toBe('tamanho')
  })
})
