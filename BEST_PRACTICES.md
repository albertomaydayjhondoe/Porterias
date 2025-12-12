# Mejor Práctica: Backend Serverless para Uploads

## Opción A: Netlify Functions (Recomendada)

```typescript
// netlify/functions/upload.ts
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const token = process.env.GITHUB_TOKEN; // Token en Netlify env vars
  
  // Lógica de upload usando GitHub API
  // Token seguro en el servidor, nunca expuesto al cliente
};
```

**Ventajas:**
- ✅ Token completamente seguro
- ✅ Funciona desde producción
- ✅ Gratis (Netlify free tier)
- ✅ Deploy automático

## Opción B: Vercel Serverless Functions

Similar a Netlify, mismo nivel de seguridad.

## Opción C: GitHub Actions + API Gateway

Crear un endpoint que triggeree workflows con secrets seguros.

## ¿Por qué NO incluir el token en el cliente?

1. **Seguridad**: Token en JavaScript = accesible a cualquiera
2. **Riesgo**: Alguien podría robar el token y destruir tu repo
3. **Buena práctica**: Secretos SIEMPRE en el servidor
4. **Compliance**: Viola políticas de seguridad estándar

## Recomendación Final

**Mantener el flujo actual:**
- Admin local con token en `.env`
- Producción sin token (solo lectura)
- Simple, seguro, efectivo

Si necesitas upload desde producción, implementar Netlify/Vercel Functions.
