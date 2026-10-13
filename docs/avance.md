# Registro de avance

> 📄 **Archivo compartido:** está copiado igual en [cineweb-frontend](https://github.com/liamlucca/cineweb-frontend) y [TP-BackEnd](https://github.com/EduardoMarino73/TP-BackEnd), en `docs/`. Si lo cambiás, cambialo en los dos.

> **Cómo se armó.** Este registro se reconstruyó el 2026-10-13 **solo a partir del historial de
> git**: rama `liam` del frontend, las ramas del backend
> ([TP-BackEnd](https://github.com/EduardoMarino73/TP-BackEnd): `main`, `Eduardo`, `Liam`,
> `Candela`) y el fork del TP. No es un acta de reuniones: las reuniones reales se registran en
> [minutas/](minutas/README.md). Lo que no quedó en un commit (reuniones, tareas repartidas por
> chat) no aparece acá y lo tiene que completar el equipo.

## Resumen por integrante

Cuentas de git tal como aparecen en el historial. Hay que confirmar a qué integrante corresponde
cada una.

| Cuenta de git | Integrante | Frontend (`liam`) | Backend (todas las ramas) | Fork del TP (2026) |
|---|---|---|---|---|
| `Liam` / `Liam Lucca` | Lucca, Liam Santiago | 78 | 36 | 5 |
| `Cande-R`, `Candy-Ram` | Requelme, Candela M _(a confirmar)_ | 8 | 6 | 11 |
| `EduardoMarino73` | Marino, Eduardo | 2 | 29 | 9 |

Los conteos incluyen los commits de merge.

## Avance por mes

### Abril 2026

- **Propuesta** (fork del TP, 08 y 09/04): se escribe y corrige `proposal.md` (Candy-Ram,
  EduardoMarino73) y se anotan los integrantes (Liam Lucca).
- **Frontend** (27 al 29/04, Liam): se crea el proyecto, la estructura básica, la pantalla para
  subir video y un primer diseño.
- **Backend** (27 y 29/04, EduardoMarino73): proyecto con Express y Multer, servidor levantado y
  recepción de videos desde el frontend.

### Mayo 2026

- **Frontend** (08 al 12/05, Liam): se prueba Flowbite y se reemplaza por DaisyUI en la página de
  inicio; primeras películas traídas del backend.
- **Backend** (05 y 06/05, EduardoMarino73): listado de películas y series guardadas en carpetas.
- **Fork del TP** (10/05, Liam Lucca): links a los repositorios y enlace visible a la propuesta.

### Junio 2026

- **Frontend** (08 y 10/06, Liam): pantalla de ingreso (`AuthPage`) y de búsqueda (`SearchPage`).
- **Frontend** (24/06, Cande-R): pantallas de reportes y denuncia, unidas con el pull request #1
  (rama `Candela`).

### Julio 2026

- **Backend** (11 al 17/07, EduardoMarino73): CRUD de películas completo (findAll, findOne, create,
  update, delete).

### Agosto 2026

- **Frontend** (17 al 21/08, Liam): adaptación al nuevo backend, páginas de inicio y de video,
  reproductor, barra de progreso al subir, ajustes de diseño y del buscador.
- **Frontend** (18/08, EduardoMarino73): orden de `data` y `archivo` al subir, para que el backend
  genere la ruta del archivo.
- **Frontend** (20/08, Cande-R): pantalla "Mis videos" conectada al backend, con botones de
  eliminar y editar.
- **Backend** (01 al 19/08, EduardoMarino73): cambio de MongoDB a MySQL, CRUD de películas sobre la
  base, episodios y armado de las rutas de los archivos.
- **Backend** (17 al 21/08, Liam): CORS, `init.sql` y `.env.example`, reproducción de video por
  streaming y corrección de rutas de archivos.
- **Backend** (19 y 20/08, Cande-R): commits en la rama `Candela` (cambios y merges con `main`).

### Septiembre 2026

- **Frontend** (16 y 18/09, Liam): traducción del código al inglés.
- **Backend** (18/09, Liam): traducción del código al inglés.

### Octubre 2026 (hasta el 12/10)

- **Frontend** (Liam), del 05/10 al 12/10:
  - Sistema de usuarios: tipos, sesión, servicio de autenticación (real y de prueba), contexto,
    rutas protegidas por rol, ingreso, registro y cierre de sesión contra el backend.
  - Diagrama de dominio, bocetos y manual del código en `docs/`.
  - Servicios por entidad y manejo de errores amigable; primeros tests unitarios (Vitest).
  - Series: temporadas, episodios, alta en tres pasos y edición desde "Mis videos".
  - Denuncias con el catálogo de motivos, valoraciones "Me gusta" / "No me gusta", perfil con
    actividad y apelaciones, "Ver más tarde".
  - Administración: apelaciones pendientes, listado y detalle de denuncias con filtros, CRUD de
    motivos de denuncia y cuentas.
  - Rediseño visual (miniaturas, carruseles, barra de navegación, página 404) e instrucciones de
    instalación en el README.
- **Backend** (05 al 08/10, EduardoMarino73): CRUD de series, jerarquía de audiovisuales para
  películas y episodios, CRUD de reseñas y sistema de usuarios (denuncias de espectadores y
  apelaciones para administradores).
- **Backend** (05 y 06/10, Liam): merges de la rama `Eduardo` y ajustes de configuración y de
  nombres de archivo.
- **Backend** (06 y 07/10, Cande-R): merges de `main` en la rama `Candela`.
- **Backend** (12/10, Liam): token obligatorio para escribir contenido y reseñas, errores en JSON,
  subidas con nombre único, límite de tamaño y control de tipo, borrado lógico, catálogo de motivos
  de denuncia, listado de denuncias con filtros, "Denuncias sobre mi contenido", retiro de
  apelaciones, "Ver más tarde", miniaturas y duración. _(Al 13/10 estos 19 commits estaban solo en
  el repositorio local, sin subir a GitHub.)_
- **Fork del TP** (06/10, Candy-Ram): actualización de `proposal.md`.

El detalle de cada cambio está en el historial de git (`git log liam`).
