import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(null)
  const [token, setToken]     = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al cargar la app, revisar si hay sesión guardada
  useEffect(() => {
    const tokenGuardado   = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado)
      setUsuario(JSON.parse(usuarioGuardado))
    }
    setCargando(false)
  }, [])

  const iniciarSesion = (datosToken, datosUsuario) => {
    localStorage.setItem('token',   datosToken)
    localStorage.setItem('usuario', JSON.stringify(datosUsuario))
    setToken(datosToken)
    setUsuario(datosUsuario)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken(null)
    setUsuario(null)
  }

  const estaAutenticado = !!token

  const esAdmin     = usuario?.rol === 'Administrador'
  const esAprobador = usuario?.rol === 'Aprobador'
  const esTecnico   = usuario?.rol === 'Tecnico'

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      cargando,
      estaAutenticado,
      esAdmin,
      esAprobador,
      esTecnico,
      iniciarSesion,
      cerrarSesion,
    }}>
      {children}
    </AuthContext.Provider>
  )
}