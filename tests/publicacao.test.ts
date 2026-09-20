// Publicação e resumo de visitas (épico 8.7).
import { describe, expect, it } from 'vitest'
import { motivoParaNaoPublicar, serieDiaria, somarVisitas } from '@/lib/publicacao'
import type { Cartao } from '@/types/dominio'

const cartao = (mudancas: Partial<Cartao> = {}): Cartao => ({
  id: 'u', usuario_id: 'u', nome_exibicao: 'Daniela Saboya',
  cargo: null, empresa: null, bio: null, foto_url: null, foto_vcard_url: null,
  links: [{ id: 'l', tipo: 'whatsapp', valor: '+5521998765432', rotulo: null, ordem: 0 }],
  template: 'minimalista', cor_destaque: 'azul',
  publicado: false, permitir_indexacao: false, mensagem_whatsapp: null,
  atualizado_em: new Date(), ...mudancas,
})

describe('condições para publicar (critério 8.7.2)', () => {
  it('nome e ao menos um link bastam', () => {
    expect(motivoParaNaoPublicar(cartao())).toBeNull()
  })
  it('sem nome não publica', () => {
    expect(motivoParaNaoPublicar(cartao({ nome_exibicao: '   ' }))).toBe('sem_nome')
  })
  it('sem link não publica', () => {
    expect(motivoParaNaoPublicar(cartao({ links: [] }))).toBe('sem_link')
  })
  it('falta de nome é apontada antes da falta de link', () => {
    // A ordem importa: a pessoa conserta uma coisa por vez, e o nome vem
    // primeiro na tela.
    expect(motivoParaNaoPublicar(cartao({ nome_exibicao: '', links: [] }))).toBe('sem_nome')
  })
})

describe('soma de visitas (critério 8.7.7)', () => {
  it('soma campo a campo', () => {
    expect(somarVisitas([
      { total: 3, por_link: 2, por_codigo: 1, salvou_contato: 1, abriu_whatsapp: 0 },
      { total: 5, por_link: 1, por_codigo: 4, salvou_contato: 0, abriu_whatsapp: 2 },
    ])).toEqual({ total: 8, por_link: 3, por_codigo: 5, salvou_contato: 1, abriu_whatsapp: 2 })
  })
  it('documento antigo sem todos os campos não vira NaN', () => {
    // Antes da correção que inicializa os contadores, um documento criado só
    // com por_link não tinha salvou_contato.
    expect(somarVisitas([{ total: 4, por_link: 4 }])).toEqual({
      total: 4, por_link: 4, por_codigo: 0, salvou_contato: 0, abriu_whatsapp: 0,
    })
  })
  it('lista vazia soma zero, não NaN', () => {
    expect(somarVisitas([]).total).toBe(0)
  })
})

describe('série diária (critério 8.7.7)', () => {
  const hoje = new Date('2026-09-20T12:00:00Z')

  it('devolve exatamente os dias pedidos, do mais antigo ao mais novo', () => {
    const serie = serieDiaria([], 7, hoje)
    expect(serie).toHaveLength(7)
    expect(serie[0].data).toBe('2026-09-14')
    expect(serie[6].data).toBe('2026-09-20')
  })
  it('dia sem visita aparece com zero — não some do gráfico', () => {
    const serie = serieDiaria([{ data: '2026-09-18', total: 5 }], 5, hoje)
    expect(serie.map((d) => d.total)).toEqual([0, 0, 5, 0, 0])
  })
  it('ignora data fora da janela', () => {
    const serie = serieDiaria([{ data: '2020-01-01', total: 99 }], 3, hoje)
    expect(serie.every((d) => d.total === 0)).toBe(true)
  })
})
