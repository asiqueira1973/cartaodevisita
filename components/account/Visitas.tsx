// Visitas dos últimos 30 dias (critério 8.7.7).
//
// Componente de servidor e gráfico em SVG puro — sem biblioteca. O painel é
// monocromático (spec 16.6), então a barra é preta e o fundo é cinza claro;
// nenhuma cor semântica entra aqui.
//
// Tudo que aparece vem de `visitas_diarias`, que não guarda NADA sobre quem
// visitou (pegadinha 18.4.5). Não há "de onde veio", não há cidade, não há
// visitante único — e é de propósito.

import { serieDiaria, somarVisitas, type ResumoDeVisitas } from '@/lib/publicacao'
import type { VisitaDiaria } from '@/types/dominio'

const DIAS = 30

export function Visitas({ dias }: { dias: VisitaDiaria[] }) {
  const resumo = somarVisitas(dias)
  const serie = serieDiaria(dias, DIAS, new Date())
  const maior = Math.max(...serie.map((d) => d.total), 1)

  if (resumo.total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-traco-forte px-5 py-8 text-center">
        <p className="text-sm leading-relaxed text-tinta-fraca">
          Nenhuma visita ainda. Compartilhe seu link ou mostre o QR code —
          <br />
          os números aparecem aqui no mesmo dia.
        </p>
      </div>
    )
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Numero rotulo="Visitas" valor={resumo.total} destaque />
        <Numero rotulo="Salvaram o contato" valor={resumo.salvou_contato} />
        <Numero rotulo="Abriram o WhatsApp" valor={resumo.abriu_whatsapp} />
        <Numero rotulo="Por QR ou etiqueta" valor={resumo.por_codigo} />
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-semibold text-tinta">Últimos {DIAS} dias</span>
        <svg
          viewBox={`0 0 ${DIAS * 10 - 4} 60`}
          className="h-24 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Gráfico de visitas por dia. Total de ${resumo.total} nos últimos ${DIAS} dias.`}
        >
          {serie.map((dia, i) => {
            const altura = Math.max((dia.total / maior) * 56, dia.total > 0 ? 3 : 1)
            return (
              <rect
                key={dia.data}
                x={i * 10}
                y={60 - altura}
                width={6}
                height={altura}
                rx={1.5}
                // Dia sem visita fica num cinza fraco em vez de sumir: a
                // ausência é informação (spec 11.8).
                fill={dia.total > 0 ? '#0D0D0D' : '#ECECEC'}
              />
            )
          })}
        </svg>
        <div className="flex justify-between text-[11px] tabular-nums text-tinta-apagada">
          <span>{formatarDia(serie[0].data)}</span>
          <span>{formatarDia(serie[serie.length - 1].data)}</span>
        </div>
      </div>

      <p className="max-w-lg text-xs leading-relaxed text-tinta-apagada">
        Você vê quantas visitas teve; não vê quem entrou — e ninguém mais vê
        também. O produto não guarda nada sobre quem abre seu cartão.
      </p>
    </div>
  )
}

function Numero({ rotulo, valor, destaque }: { rotulo: string; valor: number; destaque?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-traco px-4 py-3">
      <span className={`tabular-nums ${destaque ? 'text-2xl font-bold text-tinta' : 'text-2xl font-semibold text-tinta-media'}`}>
        {valor.toLocaleString('pt-BR')}
      </span>
      <span className="text-xs text-tinta-apagada">{rotulo}</span>
    </div>
  )
}

/** "2026-09-20" vira "20/set". */
function formatarDia(data: string): string {
  const [, mes, dia] = data.split('-')
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${Number(dia)}/${meses[Number(mes) - 1]}`
}

export type { ResumoDeVisitas }
