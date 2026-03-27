import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Produto } from '@/types'
import { formatCurrency, slugify } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/admin/DashboardHeader'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'

const vazio = {
  nome: '', slug: '', descricao: '', beneficios: '', modo_de_usar: '',
  preco: '', estoque: '', ativo: true, url_imagem: '',
}

export function ProdutosPage() {
  const supabase = createClient()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [form, setForm] = useState(vazio)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    supabase
      .from('produtos')
      .select('*')
      .order('nome')
      .then(({ data }) => {
        if (data) setProdutos(data as Produto[])
      })
  }, [])

  function abrirNovo() {
    setEditando(null)
    setForm(vazio)
    setOpen(true)
  }

  function abrirEdicao(p: Produto) {
    setEditando(p)
    setForm({
      nome: p.nome, slug: p.slug,
      descricao: p.descricao ?? '', beneficios: p.beneficios ?? '',
      modo_de_usar: p.modo_de_usar ?? '', preco: String(p.preco),
      estoque: String(p.estoque), ativo: p.ativo, url_imagem: p.url_imagem ?? '',
    })
    setOpen(true)
  }

  function handleNomeChange(nome: string) {
    setForm((f) => ({ ...f, nome, slug: editando ? f.slug : slugify(nome) }))
  }

  async function handleSalvar() {
    setCarregando(true)
    const payload = {
      nome: form.nome, slug: form.slug,
      descricao: form.descricao || null,
      beneficios: form.beneficios || null,
      modo_de_usar: form.modo_de_usar || null,
      preco: parseFloat(form.preco) || 0,
      estoque: parseInt(form.estoque) || 0,
      ativo: form.ativo,
      url_imagem: form.url_imagem || null,
    }

    if (editando) {
      const { data } = await supabase.from('produtos').update(payload).eq('id', editando.id).select().single()
      if (data) setProdutos((prev) => prev.map((p) => p.id === editando.id ? data as Produto : p))
    } else {
      const { data } = await supabase.from('produtos').insert(payload).select().single()
      if (data) setProdutos((prev) => [...prev, data as Produto])
    }

    setOpen(false)
    setCarregando(false)
  }

  async function handleExcluir(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    await supabase.from('produtos').delete().eq('id', id)
    setProdutos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Produtos"
        description="Gerencie o catálogo de óleos essenciais"
      />

      <div className="flex justify-end">
        <Button onClick={abrirNovo}>
          <Plus className="h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {produtos.length === 0 ? (
        <Card className="py-16 text-center text-gray-400">
          <Package className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>Nenhum produto cadastrado ainda.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {produtos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(p.preco)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.estoque}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.ativo ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => abrirEdicao(p)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleExcluir(p.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editando ? 'Editar Produto' : 'Novo Produto'}
        className="max-w-2xl"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Nome" value={form.nome} onChange={(e) => handleNomeChange(e.target.value)} required />
          </div>
          <Input label="Slug (URL)" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          <Input label="URL da Imagem" value={form.url_imagem} onChange={(e) => setForm((f) => ({ ...f, url_imagem: e.target.value }))} placeholder="https://..." />
          <Input label="Preço (R$)" type="number" step="0.01" value={form.preco} onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))} />
          <Input label="Estoque" type="number" value={form.estoque} onChange={(e) => setForm((f) => ({ ...f, estoque: e.target.value }))} />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
            <textarea rows={2} value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Benefícios</label>
            <textarea rows={3} value={form.beneficios} onChange={(e) => setForm((f) => ({ ...f, beneficios: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Modo de Usar</label>
            <textarea rows={3} value={form.modo_de_usar} onChange={(e) => setForm((f) => ({ ...f, modo_de_usar: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="ativo" checked={form.ativo} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-brand-600" />
            <label htmlFor="ativo" className="text-sm text-gray-700">Produto ativo (visível no site)</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSalvar} loading={carregando}>Salvar</Button>
        </div>
      </Modal>
    </div>
  )
}
