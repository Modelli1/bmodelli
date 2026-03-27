import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/admin/DashboardHeader'
import { Plus, Trash2, ShoppingBag, X } from 'lucide-react'

interface ItemVenda {
  produto_id: string
  quantidade: number
  preco_unitario: number
  produto?: { id: string; nome: string; preco: number }
}

interface Venda {
  id: string
  total: number
  vendido_em: string
  observacoes: string | null
  cliente?: { id: string; nome: string } | null
  itens?: ItemVenda[]
}

export function VendasPage() {
  const supabase = createClient()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [clients, setClients] = useState<{ id: string; nome: string }[]>([])
  const [products, setProducts] = useState<{ id: string; nome: string; preco: number }[]>([])
  const [open, setOpen] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [vendidoEm, setVendidoEm] = useState(new Date().toISOString().slice(0, 10))
  const [itens, setItens] = useState<ItemVenda[]>([])

  useEffect(() => {
    Promise.all([
      supabase
        .from('vendas')
        .select('*, cliente:clientes(id, nome), itens:itens_venda(*, produto:produtos(id, nome, preco))')
        .order('vendido_em', { ascending: false }),
      supabase.from('clientes').select('id, nome').order('nome'),
      supabase.from('produtos').select('id, nome, preco').eq('ativo', true).order('nome'),
    ]).then(([{ data: sales }, { data: cls }, { data: prods }]) => {
      if (sales) setVendas(sales as Venda[])
      if (cls) setClients(cls)
      if (prods) setProducts(prods)
    })
  }, [])

  function adicionarItem() {
    setItens((prev) => [...prev, { produto_id: '', quantidade: 1, preco_unitario: 0 }])
  }

  function removerItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx))
  }

  function atualizarItem(idx: number, campo: keyof ItemVenda, valor: string | number) {
    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item
        if (campo === 'produto_id') {
          const produto = products.find((p) => p.id === valor)
          return { ...item, produto_id: String(valor), preco_unitario: produto?.preco ?? 0 }
        }
        return { ...item, [campo]: valor }
      })
    )
  }

  const total = itens.reduce((acc, item) => acc + item.quantidade * item.preco_unitario, 0)

  async function handleSalvar() {
    if (!itens.length) return alert('Adicione ao menos um item.')
    setCarregando(true)

    const { data: venda } = await supabase
      .from('vendas')
      .insert({
        cliente_id: clienteId || null,
        total,
        observacoes: observacoes || null,
        vendido_em: new Date(vendidoEm).toISOString(),
      })
      .select('*, cliente:clientes(id, nome)')
      .single()

    if (venda) {
      await supabase.from('itens_venda').insert(
        itens.map((item) => ({
          venda_id: venda.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        }))
      )

      const novaVenda: Venda = {
        ...venda,
        itens: itens.map((item) => ({
          ...item,
          produto: products.find((p) => p.id === item.produto_id),
        })),
      }

      setVendas((prev) => [novaVenda, ...prev])
      setOpen(false)
      setItens([])
      setClienteId('')
      setObservacoes('')
      setVendidoEm(new Date().toISOString().slice(0, 10))
    }

    setCarregando(false)
  }

  async function handleExcluir(id: string) {
    if (!confirm('Excluir esta venda?')) return
    await supabase.from('vendas').delete().eq('id', id)
    setVendas((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Vendas"
        description="Registre e acompanhe todas as vendas"
      />

      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar Venda
        </Button>
      </div>

      {vendas.length === 0 ? (
        <Card className="py-16 text-center text-gray-400">
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>Nenhuma venda registrada ainda.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Itens</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vendas.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{formatDate(v.vendido_em)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{v.cliente?.nome ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {v.itens?.map((i) => i.produto?.nome).filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-700">{formatCurrency(v.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleExcluir(v.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Registrar Venda" className="max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cliente</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">Sem cliente</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data da venda</label>
              <input type="date" value={vendidoEm} onChange={(e) => setVendidoEm(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Itens</span>
              <button onClick={adicionarItem} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                <Plus className="h-3.5 w-3.5" /> Adicionar item
              </button>
            </div>
            {itens.length === 0 && (
              <p className="text-sm text-gray-400">Nenhum item adicionado.</p>
            )}
            {itens.map((item, idx) => (
              <div key={idx} className="mb-2 flex items-center gap-2">
                <select value={item.produto_id} onChange={(e) => atualizarItem(idx, 'produto_id', e.target.value)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
                  <option value="">Selecione</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <input type="number" min={1} value={item.quantidade} onChange={(e) => atualizarItem(idx, 'quantidade', parseInt(e.target.value) || 1)} className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center text-sm focus:border-brand-500 focus:outline-none" />
                <input type="number" step="0.01" value={item.preco_unitario} onChange={(e) => atualizarItem(idx, 'preco_unitario', parseFloat(e.target.value) || 0)} className="w-24 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-brand-500 focus:outline-none" />
                <button onClick={() => removerItem(idx)} className="rounded p-1 text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {itens.length > 0 && (
            <div className="flex justify-end text-sm font-semibold text-gray-900">
              Total: {formatCurrency(total)}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
            <textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSalvar} loading={carregando}>Salvar Venda</Button>
        </div>
      </Modal>
    </div>
  )
}
