import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Cliente } from '@/types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/admin/DashboardHeader'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'

const vazio = { nome: '', telefone: '', email: '', observacoes: '' }

export function ClientesPage() {
  const supabase = createClient()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [form, setForm] = useState(vazio)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*')
      .order('nome')
      .then(({ data }) => {
        if (data) setClientes(data as Cliente[])
      })
  }, [])

  function abrirNovo() {
    setEditando(null)
    setForm(vazio)
    setOpen(true)
  }

  function abrirEdicao(c: Cliente) {
    setEditando(c)
    setForm({ nome: c.nome, telefone: c.telefone ?? '', email: c.email ?? '', observacoes: c.observacoes ?? '' })
    setOpen(true)
  }

  async function handleSalvar() {
    setCarregando(true)
    const payload = {
      nome: form.nome,
      telefone: form.telefone || null,
      email: form.email || null,
      observacoes: form.observacoes || null,
    }

    if (editando) {
      const { data } = await supabase.from('clientes').update(payload).eq('id', editando.id).select().single()
      if (data) setClientes((prev) => prev.map((c) => c.id === editando.id ? data as Cliente : c))
    } else {
      const { data } = await supabase.from('clientes').insert(payload).select().single()
      if (data) setClientes((prev) => [...prev, data as Cliente].sort((a, b) => a.nome.localeCompare(b.nome)))
    }

    setOpen(false)
    setCarregando(false)
  }

  async function handleExcluir(id: string) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    await supabase.from('clientes').delete().eq('id', id)
    setClientes((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Clientes"
        description="Gerencie sua base de clientes"
      />

      <div className="flex justify-end">
        <Button onClick={abrirNovo}>
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {clientes.length === 0 ? (
        <Card className="py-16 text-center text-gray-400">
          <Users className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>Nenhum cliente cadastrado ainda.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{c.telefone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.criado_em)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => abrirEdicao(c)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleExcluir(c.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
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

      <Modal open={open} onClose={() => setOpen(false)} title={editando ? 'Editar Cliente' : 'Novo Cliente'}>
        <div className="flex flex-col gap-4">
          <Input label="Nome *" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
          <Input label="Telefone / WhatsApp" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} placeholder="(11) 9 9999-9999" />
          <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
            <textarea rows={3} value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
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
