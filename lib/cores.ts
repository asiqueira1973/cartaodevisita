// As oito cores de destaque do cartão (spec 16.2).
//
// Os valores são os da seção 16.2 e já foram conferidos: `fundo` recebe texto
// branco por cima, `texto` escreve sobre branco, e os dois passam 4.5:1.
// Não invente uma nona cor aqui — a paleta é um enum (spec 7.7), e o motivo
// está em 16.2.

import type { CorDestaque } from '@/types/dominio'

export interface TonsDaCor {
  /** Fundo de botão, com texto branco por cima. */
  fundo: string
  /** A mesma cor escrevendo sobre branco. */
  texto: string
  /** Fundo bem claro, para a moldura das iniciais quando não há foto. */
  suave: string
  /** Nome que aparece na interface. */
  rotulo: string
}

export const CORES: Record<CorDestaque, TonsDaCor> = {
  azul: { fundo: '#1D4ED8', texto: '#1E40AF', suave: '#DBEAFE', rotulo: 'Azul' },
  verde: { fundo: '#15803D', texto: '#166534', suave: '#DCFCE7', rotulo: 'Verde' },
  roxo: { fundo: '#6D28D9', texto: '#5B21B6', suave: '#EDE9FE', rotulo: 'Roxo' },
  vermelho: { fundo: '#BE123C', texto: '#9F1239', suave: '#FFE4E6', rotulo: 'Vermelho' },
  laranja: { fundo: '#C2410C', texto: '#9A3412', suave: '#FFEDD5', rotulo: 'Laranja' },
  rosa: { fundo: '#BE185D', texto: '#9D174D', suave: '#FCE7F3', rotulo: 'Rosa' },
  grafite: { fundo: '#27272A', texto: '#18181B', suave: '#E4E4E7', rotulo: 'Grafite' },
  dourado: { fundo: '#A16207', texto: '#854D0E', suave: '#FEF3C7', rotulo: 'Dourado' },
}

/** Tons de uma cor, caindo no azul se vier valor desconhecido do banco. */
export function tons(cor: CorDestaque): TonsDaCor {
  return CORES[cor] ?? CORES.azul
}
