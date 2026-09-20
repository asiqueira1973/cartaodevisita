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

/** Janela de revalidação, em segundos (assunção 24.17). */
export const SEGUNDOS_DE_CACHE = 60

/**
 * Lê o cartão publicado pelo endereço, com cache de 60 segundos.
 *
 * Efeito colateral aceito e declarado (assunção 24.17): uma edição demora até
 * 60 segundos para aparecer na página pública. Quem está editando vê a
 * pré-visualização ao vivo no painel, então o atraso não atrapalha quem importa.
 */
export const lerCartaoPublicado = (handle: string) =>
  unstable_cache(
    () => buscarCartaoPorHandle(handle),
    ['cartao-publicado', handle],
    { revalidate: SEGUNDOS_DE_CACHE, tags: [`cartao:${handle}`] },
  )()
