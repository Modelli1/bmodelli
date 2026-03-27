import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/admin/DashboardHeader'
import { FiltrosDashboard } from '@/components/admin/FiltrosDashboard'
import { VendasMensaisChart } from '@/components/admin/charts/VendasMensaisChart'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, Package, ShoppingBag } from 'lucide-react'

interface Stats {
  receitaTotal: number
  totalVendas: number
  totalClientes: number
  totalProdutos: number
  vendasMensais: { mes: string; total: number }[]
}

interface SelectItem { id: string; nome: string }

function periodoParaData(periodo: string): string | null {
  const agora = new Date()
  switch (periodo) {
    case '7d':  agora.setDate(agora.getDate() - 7);        break
    case '30d': agora.setDate(agora.getDate() - 30);       break
    case '3m':  agora.setMonth(agora.getMonth() - 3);      break
    case '6m':  agora.setMonth(agora.getMonth() - 6);      break
    case '1y':  agora.setFullYear(agora.getFullYear() - 1); break
    default: return null
  }
  return agora.toISOString()
}

export function DashboardPage() {
  const [searchParams] = useSearchParams()
  const [stats, setStats] = useState<Stats>({
    receitaTotal: 0, totalVendas: 0, totalClientes: 0, totalProdutos: 0, vendasMensais: [],
  })
  const [clientes, setClientes] = useState<SelectItem[]>([])
  const [produtos, setProdutos] = useState<SelectItem[]>([])
  const [loading, setLoading] = useState(true)

  const periodo   = searchParams.get('periodo')  ?? ''
  const clienteId = searchParams.get('cliente')  ?? ''
  const produtoId = searchParams.get('produto')  ?? ''

  useEffect(() => {
    const supabase = createClient()
    setLoading(true)

    async function carregar() {
      const [{ data: cls }, { data: prods }] = await Promise.all([
        supabase.from('clientes').select('id, nome').order('nome'),
        supabase.from('produtos').select('id, nome').eq('ativo', true).order('nome'),
      ])
      if (cls) setClientes(cls)
      if (prods) setProdutos(prods)

      const dataInicio = periodoParaData(periodo)

      let vendasComProduto: string[] | null = null
      if (produtoId) {
        const { data: itens } = await supabase
          .from('itens_venda')
          .select('venda_id')
          .eq('produto_id', produtoId)
        vendasComProduto = itens?.map((i) => i.venda_id) ?? []
      }

      let query = supabase.from('vendas').select('id, total, vendido_em, cliente_id')
      if (dataInicio)         query = query.gte('vendido_em', dataInicio)
      if (clienteId)          query = query.eq('cliente_id', clienteId)
      if (vendasComProduto)   query = query.in('id', vendasComProduto.length ? vendasComProduto : [''])

      const { data: vendas } = await query.order('vendido_em')

      const vendasIds = vendas?.map((v) => v.id) ?? []
      const totalVendas  = vendas?.length ?? 0
      const receitaTotal = vendas?.reduce((acc, v) => acc + Number(v.total), 0) ?? 0

      let totalClientes = 0
      if (vendasIds.length) {
        const { data: clientesNasVendas } = await supabase
          .from('vendas').select('cliente_id').in('id', vendasIds).not('cliente_id', 'is', null)
        totalClientes = new Set(clientesNasVendas?.map((v) => v.cliente_id)).size
      }

      let totalProdutos = 0
      if (vendasIds.length) {
        const { data: itensFiltro } = await supabase
          .from('itens_venda').select('produto_id').in('venda_id', vendasIds)
        totalProdutos = new Set(itensFiltro?.map((i) => i.produto_id)).size
      }

      const vendasPorMes: Record<string, number> = {}
      vendas?.forEach((v) => {
        const mes = new Date(v.vendido_em).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        vendasPorMes[mes] = (vendasPorMes[mes] ?? 0) + Number(v.total)
      })
      const vendasMensais = Object.entries(vendasPorMes).map(([mes, total]) => ({ mes, total }))

      setStats({ receitaTotal, totalVendas, totalClientes, totalProdutos: totalProdutos, vendasMensais })
      setLoading(false)
    }

    carregar()
  }, [periodo, clienteId, produtoId])

  const temFiltro = periodo || clienteId || produtoId

  const cards = [
    { label: 'Receita Total',    value: formatCurrency(stats.receitaTotal),      icon: TrendingUp,  color: 'text-brand-600', bg: 'bg-brand-50'  },
    { label: 'Vendas',           value: String(stats.totalVendas),                icon: ShoppingBag, color: 'text-brand-500', bg: 'bg-brand-50'  },
    { label: 'Clientes',         value: String(stats.totalClientes),              icon: Users,       color: 'text-brand-700', bg: 'bg-brand-100' },
    { label: 'Tipos de produto', value: String(stats.totalProdutos),              icon: Package,     color: 'text-brand-800', bg: 'bg-brand-100' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader title="Dashboard" description="Visão geral do seu negócio" />

      <FiltrosDashboard clientes={clientes} produtos={produtos} />

      {temFiltro && !loading && (
        <p className="text-sm text-brand-600 font-medium -mt-4">
          {stats.totalVendas === 0
            ? 'Nenhuma venda encontrada com esses filtros.'
            : `Exibindo ${stats.totalVendas} venda${stats.totalVendas !== 1 ? 's' : ''} filtrada${stats.totalVendas !== 1 ? 's' : ''}.`}
        </p>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Receita {temFiltro ? 'Filtrada' : 'Mensal'}</CardTitle>
            </CardHeader>
            <VendasMensaisChart data={stats.vendasMensais} />
          </Card>
        </>
      )}
    </div>
  )
}
