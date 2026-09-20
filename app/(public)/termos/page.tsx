// /termos — termos de uso (spec 20).
//
// Adaptado do ViraPágina, com as diferenças que este produto impõe:
//
// 1. A EXCLUSÃO É IMEDIATA, não em 30 dias: aqui o botão apaga na hora
//    (critério 8.8.4). Prometer prazo seria descrever errado o que o código faz.
// 2. O conteúdo é DADO PESSOAL DO PRÓPRIO TITULAR, publicado de propósito —
//    isso muda a conversa sobre exposição (seção 20.3).
// 3. O limite do plano é de LINKS, não de arquivos.

import type { Metadata } from 'next'
import { CabecalhoPublico, RodapePublico } from '@/components/marketing/Chrome'
import { Documento, Secao } from '@/components/marketing/Documento'
import { RESPONSAVEL } from '@/lib/copy'

export const metadata: Metadata = {
  title: 'Termos de uso',
  description: 'As regras de quem publica um cartão no Cartão de Visita.',
}

export default function TermosPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-superficie">
      <CabecalhoPublico />
      <Documento titulo="Termos de uso" atualizadoEm="20 de setembro de 2026">

        <Secao titulo="Quem opera o Cartão de Visita">
          <p>
            O Cartão de Visita é operado por {RESPONSAVEL.nome}, CNPJ {RESPONSAVEL.cnpj}. Para
            qualquer assunto tratado nestes termos, o contato é{' '}
            <a href={`mailto:${RESPONSAVEL.email}`}>{RESPONSAVEL.email}</a>.
          </p>
        </Secao>

        <Secao titulo="O que o serviço faz">
          <p>
            Você monta um cartão de visitas com seu nome, foto e canais de contato, e recebe um
            endereço público onde qualquer pessoa pode abri-lo no navegador. Quem recebe o cartão
            não precisa de conta, não instala nada e não se identifica.
          </p>
          <p>
            O plano gratuito permite até 5 links no cartão e mostra a marca do produto no rodapé
            da página. Chegar ao limite impede adicionar um link novo — <strong>nunca</strong>{' '}
            tira do ar nem apaga o que já está lá.
          </p>
        </Secao>

        <Secao titulo="O conteúdo é seu, e a responsabilidade também">
          <p>
            O que aparece no seu cartão é informação que <strong>você escolheu publicar</strong>:
            seu nome, sua foto, seu telefone, seus links. Ao publicar, você declara que tem
            direito de usar esse conteúdo — inclusive a foto, se ela foi tirada por outra pessoa.
          </p>
          <p>
            Você é responsável pelo que publica, inclusive perante terceiros. Não use o Cartão de
            Visita para se passar por outra pessoa ou empresa, nem para oferecer o que você não
            pode oferecer.
          </p>
          <p>
            Se você exerce profissão regulamentada, as regras de publicidade do seu conselho
            continuam valendo aqui. Não conferimos nem opinamos sobre isso.
          </p>
        </Secao>

        <Secao titulo="Seu cartão é público, e isso é o objetivo">
          <p>
            Um cartão publicado fica acessível a quem tiver o endereço. É para isso que ele
            existe — mas vale ter clareza: <strong>o telefone e o e-mail que você colocar ficam
            visíveis</strong> para quem abrir a página.
          </p>
          <p>
            Por padrão, seu cartão <strong>não</strong> aparece em buscadores. Você pode permitir
            isso em Ajustes, e nesse caso ele passa a ser indexável. De todo modo, não temos como
            impedir que alguém copie à mão o que está na tela.
          </p>
        </Secao>

        <Secao titulo="O que podemos remover">
          <p>
            Podemos tirar do ar qualquer cartão que viole estes termos ou a lei, com ou sem
            denúncia prévia. Tirar do ar faz o link parar de funcionar;{' '}
            <strong>não apagamos o seu conteúdo</strong>, porque uma remoção indevida precisa
            poder ser desfeita.
          </p>
          <p>
            Não editamos cartão de ninguém. Não fazemos moderação prévia nem varredura
            automática: agimos quando somos avisados.
          </p>
        </Secao>

        <Secao titulo="Denunciar um cartão">
          <p>
            Se um cartão publicado aqui se passa por você, viola seus direitos ou infringe a lei,
            escreva para <a href={`mailto:${RESPONSAVEL.email}`}>{RESPONSAVEL.email}</a> com o
            endereço do cartão e o motivo. Respondemos toda denúncia.
          </p>
        </Secao>

        <Secao titulo="Encerrar sua conta">
          <p>
            Você apaga sua conta sozinho, em Ajustes. A exclusão é{' '}
            <strong>imediata e definitiva</strong>: apagamos a conta, o cartão, a foto, o
            endereço público e os números de visita na hora, sem fila e sem período de
            arrependimento.
          </p>
          <p>
            <strong>O link do seu cartão deixa de funcionar, e seu endereço volta a ficar
            disponível para outra pessoa.</strong> Se ele circula por aí — num QR impresso, numa
            etiqueta NFC —, considere isso antes de excluir. A remoção é real, não um esconder.
          </p>
          <p>
            O registro de ações de moderação, se houver alguma sobre a sua conta, é mantido — ele
            é um log das nossas decisões, não do seu conteúdo.
          </p>
        </Secao>

        <Secao titulo="Disponibilidade e mudanças">
          <p>
            O Cartão de Visita é oferecido como está, sem garantia de disponibilidade
            ininterrupta. Podemos mudar ou encerrar o serviço; se isso acontecer, avisamos com
            antecedência razoável para você salvar seus dados.
          </p>
          <p>Se mudarmos estes termos, a data no topo desta página muda junto.</p>
        </Secao>

      </Documento>
      <RodapePublico />
    </div>
  )
}
