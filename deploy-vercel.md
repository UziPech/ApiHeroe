# Deploy a Vercel con CORS Corregido

## Pasos para hacer deploy:

1. **Verificar que el archivo `app.js` tenga la configuración de CORS correcta**
   - El middleware de CORS debe estar ANTES de todas las rutas
   - Debe manejar OPTIONS requests correctamente

2. **Hacer commit de los cambios:**
   ```bash
   git add .
   git commit -m "Fix CORS configuration for Vercel deployment"
   git push
   ```

3. **Verificar en Vercel Dashboard que el deploy se complete correctamente**

4. **Probar el endpoint después del deploy:**
   - Ir a: https://apiheroe.vercel.app/
   - Debería mostrar la respuesta JSON con los endpoints

5. **Probar CORS específicamente:**
   - Usar el script `test-cors.js` para verificar que los headers de CORS se envíen correctamente

## Cambios realizados:

- ✅ Middleware de CORS movido al inicio del archivo
- ✅ Manejo correcto de OPTIONS requests
- ✅ Headers de CORS completos incluidos
- ✅ Eliminación de middleware duplicado

## URLs importantes:
- API: https://apiheroe.vercel.app
- Documentación: https://apiheroe.vercel.app/docs
- Swagger: https://apiheroe.vercel.app/api-docs 