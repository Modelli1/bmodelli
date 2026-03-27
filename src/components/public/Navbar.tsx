import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm">
      <div className="container-section flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-brand-700">
            bmodelli<span className="text-brand-400">.oe</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="/#produtos" className="text-gray-600 hover:text-brand-700 transition-colors">
            Produtos
          </a>
          <a href="/#sobre" className="text-gray-600 hover:text-brand-700 transition-colors">
            Sobre
          </a>
          <a href="/#contato" className="text-gray-600 hover:text-brand-700 transition-colors">
            Contato
          </a>
        </nav>

        <a
          href="https://wa.me/55"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          Falar no WhatsApp
        </a>
      </div>
    </header>
  )
}
