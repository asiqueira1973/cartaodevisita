'use client'

// Mantém a tela acesa enquanto o QR está aberto (critério 8.5.5).
//
// O critério fala em "subir o brilho". Isso NÃO é possível: nenhum navegador
// expõe controle de brilho, e não há API padrão nem proprietária para isso na
// web. O que existe é a Screen Wake Lock, que impede a tela de apagar — e que
// resolve o problema real, que é a tela dormir no meio do "aponta a câmera".
//
// Degrada em silêncio: navegador sem suporte, ou permissão negada, e a página
// funciona igual, sem mostrar erro (critério 8.5.5).

import { useEffect } from 'react'

export function ManterTelaAcesa() {
  useEffect(() => {
    let trava: WakeLockSentinel | null = null
    let cancelado = false

    async function travar() {
      try {
        if (!('wakeLock' in navigator)) return
        const sentinela = await navigator.wakeLock.request('screen')
        if (cancelado) { void sentinela.release(); return }
        trava = sentinela
      } catch {
        // Sem suporte, sem permissão, ou aba em segundo plano. Segue igual.
      }
    }

    void travar()

    // O navegador solta a trava sozinho ao trocar de aba; ao voltar, pede de novo.
    const aoVoltar = () => { if (document.visibilityState === 'visible') void travar() }
    document.addEventListener('visibilitychange', aoVoltar)

    return () => {
      cancelado = true
      document.removeEventListener('visibilitychange', aoVoltar)
      void trava?.release().catch(() => {})
    }
  }, [])

  return null
}
