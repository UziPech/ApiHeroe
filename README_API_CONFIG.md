# Configuración de API - Superheroes Battle Game

## Problema Resuelto

Antes, cada vez que se hacía un nuevo deploy del backend en Vercel, había que cambiar las URLs en múltiples archivos del frontend. Esto causaba errores de conectividad y CORS.

## Solución Implementada

Se creó un archivo de configuración centralizado: `src/config/api.js`

### Cómo funciona:

1. **Configuración centralizada**: Todas las URLs del backend están en un solo lugar
2. **Funciones helper**: Para construir URLs y headers automáticamente
3. **Fácil actualización**: Solo hay que cambiar la URL en un archivo

### Archivos actualizados:

- ✅ `src/pages/LoginPage.jsx`
- ✅ `src/pages/SelectCharacterPage.jsx` 
- ✅ `src/pages/BattlePage.jsx`

## Cómo actualizar la URL del backend

### Cuando hagas un nuevo deploy del backend:

1. Ve a `src/config/api.js`
2. Cambia la línea:
   ```javascript
   BASE_URL: 'https://apiheroe-r5vtoj1ra-uziels-projects-fa4bbf7c.vercel.app',
   ```
3. Reemplaza con la nueva URL de Vercel
4. Haz commit y deploy del frontend

### Ejemplo:
```javascript
// Antes
BASE_URL: 'https://apiheroe-r5vtoj1ra-uziels-projects-fa4bbf7c.vercel.app',

// Después (nuevo deploy)
BASE_URL: 'https://apiheroe-nuevo-deploy-123.vercel.app',
```

## Funciones disponibles

### `buildApiUrl(endpoint)`
Construye una URL completa para cualquier endpoint:
```javascript
buildApiUrl('/api/heroes') // → https://apiheroe-xxx.vercel.app/api/heroes
```

### `getAuthHeaders(token)`
Headers para endpoints que requieren autenticación:
```javascript
headers: getAuthHeaders(token)
```

### `getPublicHeaders()`
Headers para endpoints públicos:
```javascript
headers: getPublicHeaders()
```

## Beneficios

- ✅ **Un solo lugar para cambiar URLs**
- ✅ **Menos errores de conectividad**
- ✅ **Código más limpio y mantenible**
- ✅ **Headers consistentes**
- ✅ **Fácil debugging**

## Notas importantes

- Siempre verifica que la nueva URL de Vercel esté funcionando antes de hacer deploy
- Los endpoints públicos (`/api/heroes`, `/api/villains`, `/api/users/register`, `/api/users/login`) no requieren token
- Los endpoints privados (`/api/battles/*`) requieren token de autenticación 