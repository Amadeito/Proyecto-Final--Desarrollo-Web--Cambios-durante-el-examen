# Sistema Visual de Cola de Turnos - Node.js

Repositorio del proyecto.

Incluye: backend en Node.js + Express + Socket.IO, conexión a SQL Server, frontend mínimo (HTML/JS) para Recepción, Médico y Display, script SQL de creación y datos de ejemplo.

## Quick start (local)
1. Clona el repo (o copia los archivos).
2. Backend:
   - `cd backend`
   - Copia `.env.example` a `.env` y completa las variables.
   - `npm install`
   - Ejecuta el script SQL en tu instancia de SQL Server: `sql/create_tables.sql`.
   - `npm run dev` (requiere nodemon) o `npm start`.
3. Frontend:
   - Abrir `frontend/login.html` en el navegador (o servir la carpeta `frontend` con cualquier static server).
