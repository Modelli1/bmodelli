import { Link } from 'react-router-dom'
import { Produto } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ProductCardProps {
  produto: Produto
}

export function ProductCard({ produto }: ProductCardProps) {
  return (
    <Link
      to={`/produtos/${produto.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        {produto.url_imagem ? (
          <img
            src={produto.url_imagem}
            alt={produto.nome}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl">🌿</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
          {produto.nome}
        </h3>

        {produto.descricao && (
          <p className="line-clamp-2 text-sm text-gray-500">{produto.descricao}</p>
        )}

        <div className="mt-auto pt-2">
          <span className="text-lg font-bold text-brand-700">
            {formatCurrency(produto.preco)}
          </span>
        </div>
      </div>
    </Link>
  )
}
