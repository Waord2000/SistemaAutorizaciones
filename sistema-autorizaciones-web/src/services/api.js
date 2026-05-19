import axios from 'axios'

// URL base de tu API .NET
const API_URL = 'https://localhost:7252/api'

// Instancia de axios configurada
const api = axios.create({
  baseURL: API_URL,
})

// Interceptor — agrega el token JWT a cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor — maneja errores de sesión expirada
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Servicios de Auth ─────────────────────────────────────────
export const authServicio = {
  login: (credenciales) =>
    api.post('/Auth/login', credenciales),
}

// ── Servicios de Usuarios ─────────────────────────────────────
export const usuariosServicio = {
  obtenerTodos:       ()           => api.get('/Usuarios'),
  obtenerTecnicos:    ()           => api.get('/Usuarios/tecnicos'),
  obtenerAprobadores: ()           => api.get('/Usuarios/aprobadores'),
  crear:              (datos)      => api.post('/Usuarios', datos),
  editar:             (id, datos)  => api.put(`/Usuarios/${id}`, datos),
  cambiarEstado:      (id, activo) => api.put(`/Usuarios/${id}/estado`, { activo }),
  eliminar:           (id)         => api.delete(`/Usuarios/${id}`),
}

// ── Servicios de Áreas ────────────────────────────────────────
export const areasServicio = {
  obtenerTodas:    ()         => api.get('/Areas'),
  obtenerMaquinas: (id)       => api.get(`/Areas/${id}/maquinas`),
  crearArea:       (datos)    => api.post('/Areas', datos),
  crearMaquina:    (id, datos) => api.post(`/Areas/${id}/maquinas`, datos),
  editarMaquina:   (id, datos) => api.put(`/Areas/maquinas/${id}`, datos),
  eliminarArea:    (id)         => api.delete(`/Areas/${id}`),         
  eliminarMaquina: (id)         => api.delete(`/Areas/maquinas/${id}`),
}

// ── Servicios de Autorizaciones ───────────────────────────────
export const autorizacionesServicio = {
  obtenerTodas:     ()      => api.get('/Autorizaciones'),
  obtenerPorId:     (id)    => api.get(`/Autorizaciones/${id}`),
  crear:            (datos) => api.post('/Autorizaciones', datos),
  firmarAprobador:  (id)    => api.put(`/Autorizaciones/${id}/firmar-aprobador`),
  firmarTecnico:    (id)    => api.put(`/Autorizaciones/${id}/firmar-tecnico`),
  cancelar:         (id, motivo) => api.put(`/Autorizaciones/${id}/cancelar`, JSON.stringify(motivo), {
    headers: { 'Content-Type': 'application/json' }
  }),
  completar:        (id)    => api.put(`/Autorizaciones/${id}/completar`),
}

// ── Servicios de Notificaciones ───────────────────────────────
export const notificacionesServicio = {
  obtenerMias:      ()   => api.get('/Notificaciones'),
  contarSinLeer:    ()   => api.get('/Notificaciones/sin-leer/cantidad'),
  marcarLeida:      (id) => api.put(`/Notificaciones/${id}/leer`),
  marcarTodasLeidas:()   => api.put('/Notificaciones/leer-todas'),
}

export default api