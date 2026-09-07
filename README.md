<p align="center">
  <img src="icono.svg" alt="Quisqueya Talent" width="80" />
</p>

<h1 align="center">Quisqueya Talent</h1>

<p align="center">
  <strong>Bolsa de Empleo con IA para República Dominicana 🇩🇴</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MySQL-XAMPP-blue?logo=mysql" alt="MySQL" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
</p>

---

## 📖 Descripción

**Quisqueya Talent** es una plataforma de empleo moderna diseñada específicamente para el mercado laboral de República Dominicana. Conecta candidatos y empresas de manera eficiente con funcionalidades avanzadas como creación de currículums con IA, gestión de vacantes, postulaciones en línea y paneles de control especializados por rol.

---

## ✨ Características Principales

### 👤 Para Candidatos
- **Constructor de CV con IA** — Asistente inteligente para redactar resúmenes y descripciones profesionales
- **11 plantillas de currículum** — Cronológica, Elegante, Circular, Moderna, Deluxe, Clásica, Informal, Horizontal, Vertical, Metro y Sencilla
- **Foto de perfil en el CV** — Subida y recorte de imagen integrado
- **Gestión de postulaciones** — Seguimiento del estado de cada aplicación
- **Alertas de empleo** — Notificaciones de vacantes según criterios personalizados

### 🏢 Para Empresas
- **Panel de empresa** — Gestión centralizada de vacantes y postulantes
- **Publicación de vacantes** — Soporte para aplicación vía plataforma o correo electrónico directo
- **Sistema ATS (Applicant Tracking System)** — Kanban para mover candidatos entre etapas
- **Difusión en redes sociales** — Generación de contenido para compartir vacantes
- **Verificación de empresa** — Proceso de validación con RNC

### 🛡️ Para Administradores
- **Panel de administración** — Control total sobre usuarios, empresas y vacantes
- **Gestión de anuncios** — Configuración de espacios publicitarios (Google AdSense)
- **Auditoría** — Registro de acciones críticas en el sistema

---

## 🗂️ Estructura del Proyecto

```
QuisqueyaTalent/
├── frontend/               # Aplicación Next.js
│   ├── public/             # Recursos estáticos (logo, icono, imágenes)
│   └── src/
│       ├── app/
│       │   ├── auth/       # Login y registro
│       │   ├── dashboard/
│       │   │   ├── candidato/      # Dashboard del candidato
│       │   │   │   ├── cv/         # Constructor de CV (11 plantillas)
│       │   │   │   └── postulaciones/
│       │   │   └── empresa/        # Dashboard de empresa
│       │   │       └── vacantes/
│       │   ├── empleos/    # Listado y detalle de empleos
│       │   └── empresas/   # Directorio de empresas
│       ├── components/     # Navbar, Footer, Logo, AdSlot
│       └── lib/            # Auth context (JWT)
│
└── backend/                # API REST con Node.js
    ├── prisma/
    │   ├── schema.prisma   # Esquema de base de datos
    │   └── seed.ts         # Datos iniciales
    └── src/
        ├── middleware/     # Autenticación JWT
        └── modules/
            ├── auth/       # Registro, login, tokens
            ├── jobs/       # CRUD vacantes
            ├── companies/  # CRUD empresas
            ├── resumes/    # CRUD currículums
            ├── applications/ # Postulaciones y estado
            ├── admin/      # Rutas de administración
            ├── ads/        # Gestión de anuncios
            └── ai/         # Integración con IA para CV
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 |
| **Backend** | Node.js, Express 5, TypeScript 5 |
| **ORM** | Prisma 5.22 |
| **Base de Datos** | MySQL (XAMPP) |
| **Autenticación** | JWT (jsonwebtoken) + bcryptjs |
| **Validación** | Zod |
| **Iconos** | Lucide React |
| **Subida de archivos** | Multer |

---

## 🗄️ Modelo de Base de Datos

```
Users ──────────── UserProfile
  │
  ├── CompanyMember ── Company ── Job ── JobSkill
  │                                 └── Application ── ApplicationStatusHistory
  ├── Resume ── ResumeExperience
  │         ├── ResumeEducation
  │         ├── ResumeSkill
  │         ├── ResumeLanguage
  │         └── ResumeCertification
  ├── SavedJob
  ├── JobAlert
  └── AuditLog

AdSlot (gestión publicitaria independiente)
```

**Roles de usuario:** `JOB_SEEKER` · `COMPANY_OWNER` · `COMPANY_RECRUITER` · `ADMIN` · `SUPER_ADMIN`

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 20+
- XAMPP con MySQL corriendo en el puerto `3306`
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/11carlosivan/QuisqueyaTalent.git
cd QuisqueyaTalent
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear el archivo `.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/quisqueya_talent"
JWT_SECRET="tu_clave_secreta_muy_segura"
PORT=5000
```

Ejecutar migraciones y seed:

```bash
npx prisma db push
npm run seed
```

Iniciar el servidor:

```bash
npm run dev
# El backend estará en http://localhost:5000
```

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crear el archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
# El frontend estará en http://localhost:3000
```

---

## 🎨 Plantillas de Currículum

El constructor de CV incluye **11 diseños profesionales**:

| # | Nombre | Descripción |
|---|--------|-------------|
| 1 | **Cronológica** | Clásica con barra de acento superior |
| 2 | **Elegante** | Encabezado a color completo, sidebar lateral |
| 3 | **Circular** | Estilo académico con cabecera curva y foto circular |
| 4 | **Moderna** | Sidebar de color sólido, alto contraste |
| 5 | **Deluxe** | Monograma de lujo, marco doble, tipografía serif |
| 6 | **Clásica** | Bandas horizontales oscuras, optimizada para ATS |
| 7 | **Informal** | Fondo pastel, etiquetas redondeadas |
| 8 | **Horizontal** | Banda ancha superior, dos columnas |
| 9 | **Vertical** | Franja delgada vertical en margen izquierdo |
| 10 | **Metro** | Bloques geométricos estilo diseño suizo |
| 11 | **Sencilla** | Minimalista nórdico, máximo espacio blanco |

---

## 🔑 API Endpoints Principales

| Módulo | Método | Ruta | Descripción |
|--------|--------|------|-------------|
| **Auth** | POST | `/api/auth/register` | Registro de usuario |
| **Auth** | POST | `/api/auth/login` | Inicio de sesión |
| **Jobs** | GET | `/api/jobs` | Listado de empleos |
| **Jobs** | POST | `/api/jobs` | Crear vacante |
| **Jobs** | GET | `/api/jobs/:slug` | Detalle de vacante |
| **Companies** | GET | `/api/companies` | Listado de empresas |
| **Applications** | POST | `/api/applications` | Postular a vacante |
| **Resumes** | GET | `/api/resumes/my` | CV del candidato |
| **Resumes** | PUT | `/api/resumes/:id` | Actualizar CV |
| **AI** | POST | `/api/ai/suggest` | Sugerencia de IA para CV |
| **Admin** | GET | `/api/admin/users` | Gestión de usuarios |
| **Ads** | GET | `/api/ads` | Espacios publicitarios |

---

## 🌐 Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión MySQL | `mysql://root:@localhost:3306/quisqueya_talent` |
| `JWT_SECRET` | Clave secreta para JWT | `mi_clave_super_secreta` |
| `PORT` | Puerto del servidor | `5000` |

### Frontend (`frontend/.env.local`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend | `http://localhost:5000/api` |

---

## 📋 Scripts Disponibles

### Backend
```bash
npm run dev      # Desarrollo con hot-reload (ts-node-dev)
npm run build    # Compilar TypeScript
npm run start    # Producción
npm run seed     # Poblar base de datos con datos de prueba
```

### Frontend
```bash
npm run dev      # Servidor de desarrollo Next.js
npm run build    # Build de producción
npm run start    # Servir build de producción
npm run lint     # Lint con ESLint
```

---

## 🗺️ Rutas del Frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page principal |
| `/auth/login` | Inicio de sesión |
| `/auth/register` | Registro de usuario |
| `/empleos` | Búsqueda y listado de empleos |
| `/empleos/[slug]` | Detalle de empleo |
| `/empresas` | Directorio de empresas |
| `/empresas/[slug]` | Perfil de empresa |
| `/dashboard/candidato` | Panel del candidato |
| `/dashboard/candidato/cv` | Constructor de CV |
| `/dashboard/candidato/postulaciones` | Mis postulaciones |
| `/dashboard/empresa` | Panel de empresa |
| `/dashboard/empresa/vacantes/nueva` | Publicar vacante |
| `/dashboard/empresa/vacantes/[id]/ats` | ATS / Pipeline |
| `/dashboard/empresa/vacantes/[id]/social` | Difusión en redes |
| `/admin` | Panel de administración |

---

## 🤝 Contribuir

1. Haz un fork del repositorio
2. Crea una rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios y haz commit: `git commit -m 'feat: descripción'`
4. Sube la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y su uso está restringido al equipo de desarrollo de **Quisqueya Talent**.

---

<p align="center">Hecho con ❤️ para República Dominicana 🇩🇴</p>
