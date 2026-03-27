import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: { mes: string; total: number }[]
}

export function VendasMensaisChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-gray-400 text-sm">
        Nenhuma venda registrada ainda.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(v) => `R$${v}`}
          tick={{ fontSize: 12 }}
          width={64}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Receita']}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar dataKey="total" fill="#8b2be2" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
