import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from '@/components/public/ProductCard'
import { Produto } from '@/types'

export function HomePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('nome')
      .then(({ data }) => {
        if (data) setProdutos(data as Produto[])
      })
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-white py-20">
        <div className="container-section text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-500">
            Consultora doTERRA
          </p>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Bem-estar natural{' '}
            <span className="text-brand-700">gota a gota</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Óleos essenciais puros e terapêuticos para equilibrar mente, corpo e emoções.
            Cada gota carrega a força da natureza.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#produtos"
              className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Ver produtos
            </a>
            <a
              href="https://wa.me/55"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-brand-300 px-6 py-3 font-medium text-brand-700 hover:bg-brand-50 transition-colors"
            >
              Falar com a Bruna
            </a>
          </div>
        </div>
      </section>

      {/* Produtos */}
      <section id="produtos" className="py-16">
        <div className="container-section">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Nossos Produtos</h2>
            <p className="mt-2 text-gray-500">
              Óleos essenciais doTERRA de alta qualidade terapêutica
            </p>
          </div>

          {produtos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {produtos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400">
              <p className="text-5xl mb-4">🌿</p>
              <p className="text-lg">Em breve nossos produtos estarão disponíveis aqui.</p>
            </div>
          )}
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="bg-brand-50 py-16">
        <div className="container-section max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sobre a Bruna</h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            Aromaterapeta e consultora doTERRA, apaixonada por proporcionar bem-estar
            através do poder dos óleos essenciais. Há anos auxiliando pessoas a
            encontrar equilíbrio emocional, físico e espiritual com a força da natureza.
          </p>
          <a
            href="https://instagram.com/bmodelli.oe"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-brand-700 font-medium hover:underline"
          >
            Siga no Instagram @bmodelli.oe →
          </a>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16">
        <div className="container-section max-w-xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">Fale Comigo</h2>
          <p className="mt-4 text-gray-500">
            Dúvidas, pedidos ou consultorias — estou aqui para te ajudar!
          </p>
          <a
            href="https://wa.me/55"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-green-500 px-8 py-4 text-lg font-medium text-white hover:bg-green-600 transition-colors"
          >
            💬 Chamar no WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
