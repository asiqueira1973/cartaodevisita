// A página pública do cartão (épico 8.4).
//
// É a tela mais importante do produto: lida em pé, num evento, no 4G ruim, por
// alguém que acabou de encostar o celular numa etiqueta (princípio 0.2).
//
// Componente de servidor. Todo o conteúdo sai no HTML, e a página funciona com
// JavaScript desativado — o único pedaço que precisa de JS é o botão de copiar
// a chave PIX, que degrada mostrando a chave como texto.
//
// NADA AQUI FALA COM O VISÃO DE PRODUTO (regra 21.3.1). O único registro é o
// contador agregado por dia, sem nenhum dado de visitante.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { lerCartaoPublicado } from '@/lib/cache'
import { buscarCartaoDoDono, registrarVisita } from '@/lib/firebase/firestore'
import { limitesDoPlano } from '@/lib/planos'
import { CardPublico } from '@/components/card/CardPublico'
import { TEXTOS } from '@/lib/copy'

interface Props {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ qr?: string }>
}

/**
 * Metatags da página (critérios 8.4.7 e 8.4.8).
 *
 * Com `permitir_indexacao` falso — o padrão —, emite `noindex, nofollow` e
 * NÃO emite Open Graph, para o cartão não ganhar prévia rica ao ser colado num
 * grupo de WhatsApp sem a pessoa ter pedido (spec 16.5).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const achado = await lerCartaoPublicado(handle)
  if (!achado) return { title: TEXTOS.naoEncontradoTitulo, robots: { index: false, follow: false } }

  const { cartao } = achado
  const descricao = [cartao.cargo, cartao.empresa].filter(Boolean).join(' · ') || cartao.bio || undefined

  if (!cartao.permitir_indexacao) {
    return { title: cartao.nome_exibicao, robots: { index: false, follow: false } }
  }

  const urlBase = (process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br').replace(/\/$/, '')
  return {
    title: cartao.nome_exibicao,
    description: descricao,
    alternates: { canonical: `${urlBase}/${handle}` },
    openGraph: {
      type: 'profile',
      title: cartao.nome_exibicao,
      description: descricao,
      url: `${urlBase}/${handle}`,
      images: cartao.foto_url ? [{ url: cartao.foto_url }] : undefined,
    },
    twitter: {
      card: cartao.foto_url ? 'summary' : 'summary',
      title: cartao.nome_exibicao,
      description: descricao,
    },
  }
}

export default async function CartaoPublicoPage({ params, searchParams }: Props) {
  const { handle } = await params
  const { qr } = await searchParams

  const achado = await lerCartaoPublicado(handle)

  // Cartão não publicado: o dono vê a própria pré-visualização; qualquer outra
  // pessoa toma 404 (critérios 8.4.5 e 8.4.6).
  if (!achado) {
    const previa = await previaDoDono(handle)
    if (!previa) notFound()
    return (
      <>
        <div className="sticky top-0 z-10 bg-tinta px-5 py-2.5 text-center text-[13px] font-semibold text-white">
          {TEXTOS.previaTarja}
        </div>
        <CardPublico cartao={previa.cartao} comMarca={previa.comMarca} />
      </>
    )
  }

  const { cartao, usuario } = achado

  // O acesso do próprio dono, logado, NÃO conta (critério 8.7.6): senão o
  // número mente justamente para quem mais olha para ele.
  const sessao = await auth()
  if (sessao?.user?.id !== usuario.id) {
    // `?qr` marca quem chegou pelo redirecionador permanente. O `/c/<id>` não
    // conta nada — se contasse, a mesma visita entraria duas vezes no total.
    await registrarVisita(usuario.id, qr !== undefined ? 'por_codigo' : 'por_link')
  }

  return <CardPublico cartao={cartao} comMarca={limitesDoPlano(usuario.plano).marcaNoRodape} />
}

/**
 * Devolve o cartão despublicado APENAS para o próprio dono (critério 8.4.6).
 *
 * Lê sem cache, de propósito: quem está editando precisa ver o que acabou de
 * salvar, sem esperar os 60 segundos da assunção 24.17.
 */
async function previaDoDono(handle: string) {
  const sessao = await auth()
  if (!sessao?.user?.id) return null

  const { garantirUsuario } = await import('@/lib/firebase/firestore')
  const usuario = await garantirUsuario(
    sessao.user.id, sessao.user.email ?? '',
    sessao.user.name ?? '', sessao.user.image ?? null,
  )
  if (usuario.handle !== handle.toLowerCase() || usuario.bloqueado) return null

  const cartao = await buscarCartaoDoDono(usuario.id)
  if (!cartao) return null

  return { cartao, comMarca: limitesDoPlano(usuario.plano).marcaNoRodape }
}
