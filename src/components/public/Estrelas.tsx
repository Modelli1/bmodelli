interface Props {
  nota: number
  tamanho?: 'sm' | 'md' | 'lg'
}

export function Estrelas({ nota, tamanho = 'md' }: Props) {
  const tamanhos = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

  return (
    <div className={`flex gap-0.5 ${tamanhos[tamanho]}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(nota) ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  )
}
