# Tracking de features, bugs e issues

> 📄 **Archivo compartido:** está copiado igual en [cineweb-frontend](https://github.com/liamlucca/cineweb-frontend) y [TP-BackEnd](https://github.com/EduardoMarino73/TP-BackEnd), en `docs/`. Si lo cambiás, cambialo en los dos.

> ⏳ **Parte a completar por el equipo:** la metodología y el tablero. El tablero y los issues se
> crean en GitHub; acá no se creó nada automáticamente. Cuando existan, reemplazar los
> "_pendiente_" por los links reales.

- **Metodología:** _pendiente (por ejemplo Kanban, o Scrum con sprints de 2 semanas)._
- **Tablero (GitHub Projects):** _pendiente_
- **Issues del frontend:** https://github.com/liamlucca/cineweb-frontend/issues
- **Issues del backend:** https://github.com/EduardoMarino73/TP-BackEnd/issues

## Estado de las features

Cada feature necesita el frontend y el backend. Las fechas salen del historial de git del
frontend (rama `liam`); ver [avance.md](avance.md).

| Feature | Requisito de la propuesta | Estado | Hecha en |
|---|---|---|---|
| Ingreso, registro y rutas protegidas por rol | CRUD Usuario, login | ✅ | 06/2026 y 05–09/10/2026 |
| Perfil: consulta y edición | CRUD Usuario | ✅ | 09/10/2026 |
| Activar y desactivar cuentas, crear administradores | CRUD Usuario, CRUD Administrador | ✅ | 09/10/2026 |
| Subir, ver, editar y borrar películas (borrado lógico) | CRUD Audiovisual | ✅ | 04–08/2026 y 10/2026 |
| Series con temporadas y episodios: alta, edición y borrado | CRUD Audiovisual | ✅ | 07–12/10/2026 |
| Miniatura y duración obtenidas en el navegador | Alcance adicional | ✅ | 12/10/2026 |
| Catálogo de motivos de denuncia | CRUD Tipo Reporte | ✅ | 12/10/2026 |
| Denunciar un video (motivo + detalle) | CRUD Denuncia | ✅ | 06/2026 y 12/10/2026 |
| Listado de denuncias con filtros y detalle | Listado + detalle 2, CUU "Buscar los datos de una Denuncia" | ✅ | 12/10/2026 |
| Apelar, retirar una apelación y resolverla | CRUD Apelación, alcance adicional | ✅ | 09–12/10/2026 |
| "Denuncias sobre mi contenido" | Alcance adicional | ✅ | 12/10/2026 |
| Búsqueda por título, tipo y categoría, con detalle | Listado + detalle 1 | ✅ | 06/2026 y 09/10/2026 |
| "Me gusta" / "No me gusta" | CUU valoración | ✅ | 09/10/2026 |
| "Ver más tarde" | CUU "Ver más tarde" | ✅ | 12/10/2026 |

## Pendientes conocidos

| Pendiente | Tipo | Entrega |
|---|---|---|
| Historial de apelaciones con cambio de veredicto (boceto C): falta el endpoint en el backend | feature | aprobación |
| Test end-to-end | tarea | aprobación |
| Filtrar por director (el backend no tiene ese campo) | feature | a definir |
| Las páginas de series no verifican que la temporada pertenezca a la serie de la URL | bug | a definir |

Más detalle técnico en el manual del frontend (`docs/MANUAL.md` de
[cineweb-frontend](https://github.com/liamlucca/cineweb-frontend), sección 4.9).

## Cómo cargar esto en GitHub

1. En GitHub: **Projects → New project → Board**, con las columnas **Backlog**, **To do**,
   **In progress**, **Done**. Agregar los dos repositorios.
2. Crear un issue por cada fila de las tablas de arriba (las hechas, cerradas con el link al
   commit; las pendientes, abiertas) y agregarlo al tablero.
3. Desde ahora: un issue por feature o bug, y mencionarlo en el commit o PR (`Closes #12`) para
   que GitHub los vincule.
4. Dar acceso de lectura a los docentes.
