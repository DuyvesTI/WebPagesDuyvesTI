This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Development & Project Setup

### Requisitos
- Node.js (v18+ recomendado) y npm instalados.
- Si tu proyecto está en Google Drive (o cualquier carpeta sincronizada en la nube), muévelo a una carpeta local (por ejemplo `C:\dev\duyvesti`) antes de ejecutar `npm install` para evitar bloqueos por sincronización.

### Instalar dependencias
```bash
npm install
```

> Si encuentras conflictos de dependencias, puedes reintentar con:
> ```bash
> npm install --legacy-peer-deps --no-audit --no-fund
> ```

### Scripts útiles
- `npm run dev` — servidor de desarrollo (Next.js)
- `npm run build` — construir para producción
- `npm run start` — ejecutar build en modo producción
- `npm run lint` — ejecutar linters (Next.js ESLint)
- `npm run lint:fix` — aplicar correcciones automáticas de ESLint
- `npm run format` — formatear con Prettier
- `npm run test` — ejecutar tests (Vitest)
- `npm run test:ci` — ejecutar tests en modo CI (sin cobertura)
- `npm run test:watch` — test en modo watch

### Pre-commit & hooks
- Usamos Husky + lint-staged para formatear y lintear archivos antes de commit.
- Para activar Husky en un repo clonado: `npm run prepare` (instala hooks).

### Verificación local rápida
```bash
npm run lint
npm run test
npm run build
```

### CI
- Se añadió un workflow de GitHub Actions en `.github/workflows/ci.yml` que ejecuta: instalar dependencias, lint, tests y build.
- El workflow subirá el artefacto de cobertura solo si existe la carpeta `coverage/`.

### Recomendaciones de editor
- Extensiones recomendadas: `ESLint`, `Prettier`, `EditorConfig`, `Jest`.

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🚀 Súper Tip SEO: Acelera tu aparición en Google

Acabamos de implementar un sistema avanzado de SEO (Metadatos, Sitemap y Robots). Para sacarle el máximo provecho, una vez que la página esté en producción bajo tu dominio principal, sigue estos pasos:

1. Ve a [Google Search Console](https://search.google.com/search-console).
2. Registra tu dominio (ej: `https://tudominio.cl`).
3. Ve a la sección **"Sitemaps"** en el menú lateral.
4. Ingresa `https://tudominio.cl/sitemap.xml` y dale a **Enviar**.

Esto "obligará" a Google a leer tu página inmediatamente y la agregará a sus resultados mucho más rápido que si esperamos a que la encuentre orgánicamente.
