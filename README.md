# Sistema de Autorizaciones de Trabajo
### Formulario Digital FO-MA-19

Proyecto de Práctica Técnica — Universidad Panamericana (UPANA)
Ingeniería en Sistemas y TICs

---

## Descripción

Sistema web que digitaliza el proceso de gestión del formulario físico 
FO-MA-19 (Autorización de Tareas), permitiendo que los procesos de 
solicitud, evaluación de riesgos, aprobación y archivo se realicen 
de manera digital, centralizada y trazable.

---

## Tecnologías utilizadas

**Backend:**
- ASP.NET Core Web API (.NET 8)
- Entity Framework Core
- MySQL 8.0
- JWT Authentication
- BCrypt para encriptación de contraseñas

**Frontend:**
- React 18 + Vite
- React Router DOM
- Axios
- jsPDF + html2canvas (generación de PDF)

- ## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| Administrador | Gestión de usuarios, áreas, máquinas y supervisión de autorizaciones |
| Aprobador | Crea, llena y firma el formulario FO-MA-19 |
| Técnico | Revisa y confirma las tareas asignadas |

---

## Flujo del proceso
Aprobador crea formulario → Firma digital del Aprobador
↓
Estado: Pendiente → Técnico recibe notificación
↓
Técnico revisa y confirma → Estado: Aprobada
↓
Administrador supervisa → Genera PDF FO-MA-19



**Walter Alexander Ordoñez Ramos**
Carné: 000114385
Universidad Panamericana — UPANA
Guatemala, 2026
