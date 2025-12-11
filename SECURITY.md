# Guía de Seguridad - Porterias

## 🛡️ Medidas de Seguridad Implementadas

### 1. Headers de Seguridad HTTP
- **X-Content-Type-Options**: `nosniff` - Previene MIME type sniffing
- **X-Frame-Options**: `DENY` - Previene clickjacking
- **X-XSS-Protection**: `1; mode=block` - Protección contra XSS
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Control de referrer
- **Permissions-Policy**: Deshabilita geolocalización, micrófono y cámara

### 2. Autenticación y Autorización

#### Rate Limiting
- Máximo 5 intentos de login fallidos
- Bloqueo de 5 minutos después de exceder el límite
- Contador de intentos por sesión

#### Validación de Credenciales
- Formato de email validado con regex
- Contraseña mínima de 6 caracteres
- Normalización de email (trim + lowercase)
- Limpieza de password del estado después del login

#### Control de Acceso
- Verificación de rol de admin en Supabase
- Row Level Security (RLS) habilitado en tablas
- Componente ProtectedRoute para rutas sensibles

### 3. Validación de Archivos

#### Subida de Imágenes
- **Tipos permitidos**: JPG, JPEG, PNG, GIF, WebP
- **Tamaño máximo**: 5MB
- **Nombres seguros**: Generados con timestamp + random
- **Validación de tipo MIME**: Verificación del tipo real del archivo
- **Prevención de sobrescritura**: Nombres únicos generados automáticamente

### 4. Sanitización de Inputs

#### Inputs de Usuario
- Eliminación de caracteres XSS (`<>`)
- Bloqueo de protocolo `javascript:`
- Eliminación de event handlers (`onload=`, etc.)
- Límite de 200 caracteres en títulos
- Trim automático de espacios

#### Validación de Fechas
- Formato YYYY-MM-DD estrictamente validado
- Verificación de fecha válida

### 5. Protección de Datos Sensibles

- Variables de entorno para credenciales
- `.env` en `.gitignore`
- Ejemplo `.env.example` sin datos reales
- Anon key de Supabase (segura para cliente)
- Service role key NUNCA expuesta en cliente

### 6. Robots.txt Configurado

```txt
Disallow: /admin        # Oculta área de administración
Disallow: /api/         # Oculta endpoints API
Disallow: /*.json$      # Oculta archivos JSON sensibles
```

### 7. Supabase Row Level Security (RLS)

#### Políticas Recomendadas

**Tabla: comic_strips**
```sql
-- Lectura pública
CREATE POLICY "Permitir lectura pública"
ON comic_strips FOR SELECT
TO public
USING (true);

-- Escritura solo admin
CREATE POLICY "Solo admin puede insertar"
ON comic_strips FOR INSERT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Actualización solo admin
CREATE POLICY "Solo admin puede actualizar"
ON comic_strips FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Eliminación solo admin
CREATE POLICY "Solo admin puede eliminar"
ON comic_strips FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

**Tabla: user_roles**
```sql
-- Solo admin puede ver roles
CREATE POLICY "Admin puede ver roles"
ON user_roles FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);
```

## 🔒 Mejores Prácticas Implementadas

### Frontend
- ✅ Validación de inputs antes de enviar
- ✅ Sanitización de datos de usuario
- ✅ Rate limiting de login
- ✅ Timeout de sesión
- ✅ Limpieza de datos sensibles del estado
- ✅ Mensajes de error genéricos (no revelan info del sistema)

### Backend (Supabase)
- ✅ RLS habilitado en todas las tablas
- ✅ Políticas específicas por operación
- ✅ Autenticación con Supabase Auth
- ✅ Roles de usuario en tabla dedicada
- ✅ Storage con permisos configurados

### Código
- ✅ No hay credenciales hardcodeadas
- ✅ Separación de configuración (security.ts)
- ✅ Funciones reutilizables de validación
- ✅ TypeScript para type safety
- ✅ ESLint configurado

## 📋 Checklist de Seguridad

Antes de cada deploy:

- [ ] Variables de entorno actualizadas
- [ ] RLS habilitado en Supabase
- [ ] Políticas de RLS validadas
- [ ] Bucket de storage con permisos correctos
- [ ] Admin user creado con rol asignado
- [ ] Rate limiting testeado
- [ ] Validación de archivos testeada
- [ ] Headers de seguridad verificados
- [ ] robots.txt actualizado
- [ ] Logs de errores no exponen información sensible

## 🚨 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:
1. NO la hagas pública
2. Contacta directamente al administrador
3. Proporciona detalles técnicos
4. Espera confirmación antes de divulgar

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
