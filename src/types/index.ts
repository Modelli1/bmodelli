export type Produto = {
  id: string
  nome: string
  slug: string
  descricao: string | null
  beneficios: string | null
  modo_de_usar: string | null
  preco: number
  estoque: number
  url_imagem: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export type Cliente = {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string
}

export type Venda = {
  id: string
  cliente_id: string | null
  total: number
  observacoes: string | null
  vendido_em: string
  criado_em: string
  cliente?: Cliente
  itens?: ItemVenda[]
}

export type ItemVenda = {
  id: string
  venda_id: string
  produto_id: string
  quantidade: number
  preco_unitario: number
  criado_em: string
  produto?: Produto
}

export type EstatisticasDashboard = {
  totalVendas: number
  receitaTotal: number
  totalClientes: number
  totalProdutos: number
  vendasMensais: { mes: string; total: number }[]
  produtosMaisVendidos: { nome: string; quantidade: number }[]
}
