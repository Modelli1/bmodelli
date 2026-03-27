import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Produto } from '@/types'
import { AvaliacaoForm } from '@/components/public/AvaliacaoForm'
import { Estrelas } from '@/components/public/Estrelas'

interface Avaliacao {
  id: string
  nome_cliente: string
  nota: number
  comentario: string | null
  criado_em: string
}

export function ProdutoPage() {
  const { slug } = useParams<{ slug: string }>()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    const supabase = createClient()

    Promise.all([
      supabase
        .from('produtos')
        .select('*')
        .eq('slug', slug)
        .eq('ativo', true)
        .single(),
      supabase
        .from('avaliacoes')
        .select('*')
        .eq('aprovado', true)
        .order('criado_em', { ascending: false }),
    ]).then(([{ data: p }, { data: avs }]) => {
      if (!p) {
        setNotFound(true)
      } else {
        setProduto(p as Produto)
        const lista = (avs ?? []).filter((a) => a.produto_id === p.id)
        setAvaliacoes(lista)
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  if (notFound || !produto) {
    return <Navigate to="/" replace />
  }

  const p = produto
  const lista = avaliacoes
  const mediaNotas = lista.length
    ? lista.reduce((acc, a) => acc + a.nota, 0) / lista.length
    : 0

  return (
    <div className="container-section py-12">
      {/* Produto principal */}
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Imagem */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-50 shadow-sm">
          {p.url_imagem ? (
            <img
              src={p.url_imagem}
              alt={p.nome}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">🌿</div>
          )}
        </div>

        {/* Detalhes */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{p.nome}</h1>

            {lista.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Estrelas nota={mediaNotas} />
                <span className="text-sm text-gray-500">
                  {mediaNotas.toFixed(1)} · {lista.length} avaliação{lista.length !== 1 ? 'ões' : ''}
                </span>
              </div>
            )}

            <p className="mt-3 text-3xl font-bold text-brand-700">
              {formatCurrency(p.preco)}
            </p>
          </div>

          {p.descricao && (
            <p className="text-gray-600 leading-relaxed">{p.descricao}</p>
          )}

          {p.beneficios && (
            <div className="rounded-xl bg-brand-50 p-5">
              <h2 className="mb-3 font-semibold text-brand-800">Benefícios</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{p.beneficios}</p>
            </div>
          )}

          {p.modo_de_usar && (
            <div className="rounded-xl bg-gray-50 p-5">
              <h2 className="mb-3 font-semibold text-gray-800">Modo de Usar</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{p.modo_de_usar}</p>
            </div>
          )}

          <a
            href="https://wa.me/55"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-8 py-4 text-lg font-medium text-white hover:bg-green-600 transition-colors shadow-sm"
          >
            💬 Tenho interesse — falar no WhatsApp
          </a>
        </div>
      </div>

      {/* Avaliações */}
      <div className="mt-16 border-t pt-12">
        <h2 className="text-2xl font-bold text-gray-900">Avaliações</h2>

        {lista.length > 0 ? (
          <>
            <div className="mt-6 flex items-center gap-6 rounded-2xl bg-brand-50 p-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-brand-700">{mediaNotas.toFixed(1)}</p>
                <Estrelas nota={mediaNotas} tamanho="lg" />
                <p className="mt-1 text-sm text-gray-500">{lista.length} avaliação{lista.length !== 1 ? 'ões' : ''}</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((n) => {
                  const qtd = lista.filter((a) => a.nota === n).length
                  const pct = lista.length ? (qtd / lista.length) * 100 : 0
                  return (
                    <div key={n} className="mb-1 flex items-center gap-2 text-sm">
                      <span className="w-4 text-gray-500">{n}</span>
                      <span className="text-yellow-400">★</span>
                      <div className="h-2 flex-1 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-gray-500">{qtd}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {lista.map((a) => (
                <div key={a.id} className="rounded-xl border bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{a.nome_cliente}</p>
                      <Estrelas nota={a.nota} />
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">
                      {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {a.comentario && (
                    <p className="mt-3 text-gray-600 leading-relaxed">{a.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-gray-400">Nenhuma avaliação ainda. Seja o primeiro!</p>
        )}

        <div className="mt-10">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Deixe sua avaliação</h3>
          <AvaliacaoForm produtoId={p.id} />
        </div>
      </div>
    </div>
  )
}
