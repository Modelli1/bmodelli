import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface Props {
  produtoId: string
}

export function AvaliacaoForm({ produtoId }: Props) {
  const supabase = createClient()
  const [nota, setNota] = useState(0)
  const [hover, setHover] = useState(0)
  const [nome, setNome] = useState('')
  const [comentario, setComentario] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (!nota) return setErro('Selecione uma nota.')
    if (!nome.trim()) return setErro('Informe seu nome.')

    setCarregando(true)
    setErro('')

    const { error } = await supabase.from('avaliacoes').insert({
      produto_id: produtoId,
      nome_cliente: nome.trim(),
      nota,
      comentario: comentario.trim() || null,
    })

    setCarregando(false)

    if (error) {
      setErro('Erro ao enviar. Tente novamente.')
    } else {
      setEnviado(true)
    }
  }

  if (enviado) {
    return (
      <div className="rounded-xl bg-brand-50 p-6 text-center text-brand-700">
        <p className="text-2xl mb-2">🌿</p>
        <p className="font-semibold">Obrigada pela sua avaliação!</p>
        <p className="text-sm mt-1 text-brand-500">Ela já está visível na página do produto.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleEnviar} className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Sua nota *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setNota(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
            >
              <span className={(hover || nota) >= i ? 'text-yellow-400' : 'text-gray-300'}>★</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Seu nome *</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como quer ser identificada"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Comentário (opcional)</label>
        <textarea
          rows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Conte sua experiência com este produto..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {erro && <p className="text-sm text-red-500">{erro}</p>}

      <Button type="submit" loading={carregando}>
        Enviar avaliação
      </Button>
    </form>
  )
}
