// Meu cartão (spec 10.2). Por enquanto só confirma que o fluxo do épico 8.1
// fecha: a conta nasceu, o endereço foi reservado e o id permanente existe.
// O editor completo é o épico 8.2.

import { auth } from '@/lib/auth'
import { garantirUsuario } from '@/lib/firebase/firestore'

export const metadata = { title: 'Meu cartão · Cartão de Visita' }

export default async function MeuCartaoPage() {
  const sessao = await auth()
  const usuario = await garantirUsuario(
    sessao!.user.id,
    sessao!.user.email!,
    sessao!.user.name ?? sessao!.user.email!,
    sessao!.user.image ?? null,
  )

  const urlBase = (process.env.NEXT_PUBLIC_URL_BASE ?? 'https://cartaodevisita.app.br').replace(/\/$/, '')

  return (
    <div className="flex flex-col gap-5 px-5 py-6 md:px-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] font-bold tracking-tight text-tinta">Meu cartão</h1>
        <p className="text-[13px] text-tinta-fraca">
          Conta criada. O editor chega no épico 8.2 do spec.
        </p>
      </div>

      <dl className="flex max-w-xl flex-col divide-y divide-traco rounded-xl border border-traco">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-[13px] font-semibold text-tinta">Endereço</dt>
          <dd className="truncate text-[13px] text-tinta-fraca">{urlBase}/{usuario.handle}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-[13px] font-semibold text-tinta">
            Endereço permanente
            <span className="ml-1.5 font-medium text-tinta-apagada">· QR e NFC</span>
          </dt>
          <dd className="truncate font-mono text-[13px] text-tinta-fraca">/c/{usuario.id_permanente}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-[13px] font-semibold text-tinta">Plano</dt>
          <dd>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              usuario.plano === 'ilimitado' ? 'bg-tinta text-white'
                : usuario.plano === 'gratuito' ? 'bg-superficie-2 text-tinta-fraca'
                : 'border border-tinta text-tinta'
            }`}>
              {{ gratuito: 'Gratuito', early_adopter: 'Early adopter', ilimitado: 'Ilimitado', pago: 'Pago' }[usuario.plano]}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  )
}
