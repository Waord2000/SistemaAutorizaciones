import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div style={estilos.contenedor}>
      <Navbar />
      <main style={estilos.contenido}>
        {children}
      </main>
    </div>
  )
}

const estilos = {
  contenedor: {
    minHeight:       '100vh',
    backgroundColor: '#F0F4F8',
    fontFamily:      'Arial, sans-serif',
  },
  contenido: {
    padding:   '32px 24px',
    maxWidth:  '1200px',
    margin:    '0 auto',
  },
}