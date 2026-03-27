import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'

interface Props {
  clientes: { id: string; nome: string }[]
  produtos: { id: string; nome: string }[]
}

const periodos = [
  { label: 'Tudo',      value: '' },
  { label: '7 dias',    value: '7d' },
  { label: '30 dias',   value: '30d' },
  { label: '3 meses',   value: '3m' },
  { label: '6 meses',   value: '6m' },
  { label: 'Este ano',  value: '1y' },
]

export function FiltrosDashboard({ clientes, produtos }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  const periodo   = searchParams.get('periodo')  ?? ''
  const clienteId = searchParams.get('cliente')  ?? ''
  const produtoId = searchParams.get('produto')  ?? ''

  function atualizar(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (valor) {
      params.set(chave, valor)
    } else {
      params.delete(chave)
    }
    navigate(`${pathname}?${params.toString()}`)
  }

  const temFiltro = periodo || clienteId || produtoId

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex overflow-hidden rounded-lg border bg-white shadow-sm">
        {periodos.map((p) => (
          <button
            key={p.value}
            onClick={() => atualizar('periodo', p.value)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              periodo === p.value
                ? 'bg-brand-600 text-white'
                : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <select
        value={clienteId}
        onChange={(e) => atualizar('cliente', e.target.value)}
        className="rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <option value="">Todos os clientes</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>

      <select
        value={produtoId}
        onChange={(e) => atualizar('produto', e.target.value)}
        className="rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <option value="">Todos os produtos</option>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>{p.nome}</option>
        ))}
      </select>

      {temFiltro && (
        <button
          onClick={() => navigate(pathname)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-sm transition-colors"
        >
          Limpar filtros ×
        </button>
      )}
    </div>
  )
}
