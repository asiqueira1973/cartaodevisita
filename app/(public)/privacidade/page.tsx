// /privacidade — política de privacidade (spec 20).
//
// A seção mais importante é "Quem abre seu cartão": ela descreve a decisão de
// arquitetura de 20.2, não uma promessa de política. O produto NÃO CONSEGUE
// identificar visitante, porque não guarda nada que permita isso — e é por isso
// que a página pública abre sem banner de cookie.

import type { Metadata } from 'next'
import { CabecalhoPublico, RodapePublico } from '@/components/marketing/Chrome'
import { Documento, Secao } from '@/components/marketing/Documento'
import { RESPONSAVEL } from '@/lib/copy'

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: 'Que dados o Cartão de Visita guarda, por quanto tempo, e o que ele não guarda.',
}

export default function PrivacidadePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-superficie">
      <CabecalhoPublico />
      <Documento titulo="Política de privacidade" atualizadoEm="20 de setembro de 2026">

        <Secao titulo="Quem é o controlador">
          <p>
            {RESPONSAVEL.nome}, CNPJ {RESPONSAVEL.cnpj}. Para exercer qualquer direito previsto na
            LGPD, escreva para <a href={`mailto:${RESPONSAVEL.email}`}>{RESPONSAVEL.email}</a>.
          </p>
        </Secao>

        <Secao titulo="Quem abre seu cartão não é identificado — e não dá para identificar">
          <p>
            Esta é a parte mais importante desta página, e ela descreve como o produto{' '}
            <strong>foi construído</strong>, não o que prometemos fazer.
          </p>
          <p>
            Quando alguém abre um cartão aqui, <strong>não guardamos endereço IP, navegador,
            aparelho, localização nem cookie de espécie alguma</strong>. Não há Google Analytics,
            não há pixel de rede social, não há ferramenta de análise de terceiro.
          </p>
          <p>
            O único registro é um contador por dia, por cartão: quantas visitas, quantas vieram
            por QR code, quantas salvaram o contato, quantas abriram o WhatsApp.{' '}
            <strong>Desse contador é impossível extrair quem visitou</strong> — ele guarda
            números, não pessoas.
          </p>
          <p>
            É por isso que a página de um cartão abre direto, sem banner de consentimento na
            frente do conteúdo: não há o que consentir.
          </p>
        </Secao>

        <Secao titulo="O que guardamos de quem tem conta">
          <p>Se você criou uma conta, guardamos:</p>
          <p>
            <strong>Da sua conta Google:</strong> e-mail, nome e foto de perfil. Servem para
            identificar sua conta e para pré-preencher seu cartão. Base legal: execução de
            contrato.
          </p>
          <p>
            <strong>O conteúdo do cartão:</strong> o que você digitou e a foto que você subiu.
            São dados pessoais que você mesmo escolheu publicar. Base legal: consentimento, dado
            no ato de publicar.
          </p>
          <p>
            <strong>Data de criação e de último acesso:</strong> para suporte e limpeza de contas
            abandonadas. Base legal: legítimo interesse.
          </p>
          <p>
            <strong>Uso do painel:</strong> eventos do que você faz enquanto está logado — criou
            conta, publicou, trocou endereço, bateu num limite. Vão para o Visão de Produto, uma
            ferramenta da própria {RESPONSAVEL.nome}, que atua como operadora. Serve para
            entender onde as pessoas travam e melhorar o produto. Base legal: legítimo interesse.
          </p>
          <p>
            <strong>Nenhum evento é registrado na página pública do cartão.</strong> A medição
            acontece do lado de dentro do login, e só.
          </p>
        </Secao>

        <Secao titulo="Com quem compartilhamos">
          <p>
            Com os serviços que fazem o produto funcionar, e só com eles: Google (login),
            Firebase (banco e arquivos), Vercel (hospedagem) e Visão de Produto (uso do painel).
          </p>
          <p>
            <strong>Não vendemos dado, não fazemos publicidade e não compartilhamos sua lista de
            contatos com ninguém</strong> — até porque não temos uma.
          </p>
        </Secao>

        <Secao titulo="Por quanto tempo">
          <p>
            Enquanto sua conta existir. Os números de visita são mantidos por até 400 dias.
            Contas sem acesso por 24 meses podem ser removidas, com aviso prévio.
          </p>
        </Secao>

        <Secao titulo="Seus direitos">
          <p>
            <strong>Acesso e correção:</strong> tudo que guardamos sobre você está visível e
            editável no painel.
          </p>
          <p>
            <strong>Eliminação:</strong> o botão em Ajustes apaga na hora — conta, cartão, foto,
            endereço e números. Sem fila, sem período de espera.
          </p>
          <p>
            <strong>Portabilidade:</strong> o próprio arquivo de contato do seu cartão, em
            formato vCard, é um arquivo aberto que você baixa a qualquer momento.
          </p>
          <p>
            <strong>Revogar o consentimento:</strong> tirar o cartão do ar o remove
            imediatamente do acesso público.
          </p>
          <p>
            Mantemos o registro de ações de moderação mesmo após a exclusão da conta, por legítimo
            interesse e para defesa em eventual processo. Esse registro guarda o identificador da
            conta e a decisão tomada — não o conteúdo do cartão.
          </p>
        </Secao>

        <Secao titulo="Segurança">
          <p>
            Todo acesso é por HTTPS. As credenciais do banco existem apenas no servidor e nunca
            chegam ao navegador. O banco recusa qualquer acesso que não venha do nosso servidor.
          </p>
          <p>
            Nenhuma senha é armazenada aqui, porque não existe senha: a autenticação é feita pelo
            Google.
          </p>
        </Secao>

        <Secao titulo="Mudanças">
          <p>Se mudarmos esta política, a data no topo desta página muda junto.</p>
        </Secao>

      </Documento>
      <RodapePublico />
    </div>
  )
}
