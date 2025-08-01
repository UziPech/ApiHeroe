# Deploy Instructions for Frontend

## ✅ Pre-requisitos Completados
- [x] Build generado correctamente (`npm run build`)
- [x] Configuración de API apuntando a producción
- [x] Archivo `vercel.json` creado para SPA routing
- [x] README actualizado

## 🚀 Pasos para Deploy en Vercel

### Opción 1: Deploy vía GitHub (Recomendado)
1. **Crear repositorio en GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin https://github.com/tu-usuario/frontend-batallas.git
   git push -u origin main
   ```

2. **Conectar a Vercel:**
   - Ir a [vercel.com](https://vercel.com)
   - "New Project" > "Import Git Repository"
   - Seleccionar el repositorio del frontend
   - Vercel detectará automáticamente que es un proyecto Vite

### Opción 2: Deploy vía Vercel CLI
1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

## 🔧 Configuración en Vercel
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 🌐 URLs Resultantes
Después del deploy tendrás:
- **Frontend:** `https://tu-proyecto.vercel.app`
- **Backend API:** `https://apiheroe.vercel.app` (ya funcionando)

## ✅ Verificaciones Post-Deploy
1. **Funcionalidad básica:** La página carga correctamente
2. **Routing:** Navegación entre páginas funciona
3. **API Connection:** Login y selección de personajes
4. **Responsive:** Se ve bien en móvil y desktop

## 🎯 Estado Actual
- ✅ **Backend:** Deployed y funcionando en `https://apiheroe.vercel.app`
- 🚀 **Frontend:** Listo para deploy (build generado)
