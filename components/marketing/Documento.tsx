// Casca dos documentos longos — termos e privacidade (spec 10.1).
//
// Coluna estreita e legível. Não usa `prose` de biblioteca nenhuma: o sistema
// visual do produto já define a tipografia, e trazer outra escala aqui faria
// estas páginas parecerem de outro site.

export function Documento({
  titulo, atualizadoEm, children,
}: {
  titulo: string
  atualizadoEm: string
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto w-full max-w-180 grow px-6 py-14 sm:px-12">
      <header className="mb-10">
        <h1 className="mb-2 font-display text-[34px] leading-tight tracking-tight text-tinta sm:text-[40px]">
          {titulo}
        </h1>
        <p className="text-[13px] text-tinta-apagada">Atualizado em {atualizadoEm}</p>
      </header>
      <div className="flex flex-col gap-9">{children}</div>
    </main>
  )
}

export function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[17px] font-semibold tracking-tight text-tinta">{titulo}</h2>
      <div className="flex flex-col gap-3.5 text-sm leading-relaxed text-tinta-media [&_a]:font-medium [&_a]:text-tinta [&_a]:underline [&_strong]:font-semibold [&_strong]:text-tinta">
        {children}
      </div>
    </section>
  )
}
