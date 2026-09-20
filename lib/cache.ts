// Cache da LEITURA da página pública (spec 4.6.2).
//
// Cacheia-se a leitura, NÃO a página. Com a página em cache o servidor não
// rodaria a cada visita, e o contador precisaria de um pixel ou de JavaScript
// no cliente — um contraria a seção 20.2, o outro contraria o princípio 0.2.
//
// Cacheando só a leitura: as duas leituras do Firestore caem para perto de zero
// em cartão com tráfego, a escrita do contador continua no servidor, e a página
// segue funcionando sem JavaScript. Um cartão visitado 50 vezes numa hora custa
// 2 leituras, não 100.

import { unstable_cache } from 'next/cache'
import { buscarCartaoPorHandle } from '@/lib/firebase/firestore'
import type { Cartao, Usuario } from '@/types/dominio'

/** Janela de revalidação, em segundos (assunção 24.17). */
export const SEGUNDOS_DE_CACHE = 60

/**
 * Revive as datas depois do cache.
 *
 * O cache do Next SERIALIZA o resultado em JSON, e nisso todo `Date` vira
 * string ISO. O tipo continua dizendo `Date`, então o erro só aparece na
 * primeira chamada de método — `atualizado_em.toISOString is not a function`,
 * dentro da geração do .vcf, e SÓ quando o cache está quente. Em
 * desenvolvimento, com o cache frio, tudo parecia certo.
 *
 * Reviver aqui, na fronteira, é melhor do que fazer cada consumidor aceitar
 * `Date | string`: isso espalharia o problema pelo código inteiro.
 */
function paraData(valor: Date | string): Date {
  return valor instanceof Date ? valor : new Date(valor)
}

/**
 * Lê o cartão publicado pelo endereço, com cache de 60 segundos.
 *
 * Efeito colateral aceito e declarado (assunção 24.17): uma edição demora até
 * 60 segundos para aparecer na página pública. Quem está editando vê a
 * pré-visualização ao vivo no painel, então o atraso não atrapalha quem importa.
 */
export async function lerCartaoPublicado(
  handle: string,
): Promise<{ cartao: Cartao; usuario: Usuario } | null> {
  const achado = await unstable_cache(
    () => buscarCartaoPorHandle(handle),
    ['cartao-publicado', handle],
    { revalidate: SEGUNDOS_DE_CACHE, tags: [`cartao:${handle}`] },
  )()

  if (!achado) return null

  return {
    cartao: { ...achado.cartao, atualizado_em: paraData(achado.cartao.atualizado_em) },
    usuario: {
      ...achado.usuario,
      criado_em: paraData(achado.usuario.criado_em),
      ultimo_acesso_em: paraData(achado.usuario.ultimo_acesso_em),
    },
  }
}
