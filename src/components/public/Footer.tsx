export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-10">
      <div className="container-section flex flex-col items-center gap-4 text-center text-sm text-gray-500 md:flex-row md:justify-between md:text-left">
        <div>
          <p className="font-semibold text-brand-700">bmodelli.oe</p>
          <p>Consultora doTERRA · Proporcionando bem-estar natural gota a gota</p>
        </div>

        <div className="flex gap-4">
          <a
            href="https://instagram.com/bmodelli.oe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-700 transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/55"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-700 transition-colors"
          >
            WhatsApp
          </a>
        </div>

        <p>© {new Date().getFullYear()} Bruna Modelli. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
