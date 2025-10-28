# Sistema de Autenticación - App de Instaladores

## Cómo Funciona la Autenticación

### 1. Sistema Implementado
He implementado autenticación segura usando **Supabase Auth** con email y contraseña.

### 2. Conversión de Teléfono a Email
Para facilitar el login con número de teléfono (como se muestra en el diseño), el sistema convierte automáticamente el teléfono a un email interno:

```
Teléfono: 618-000-0000
Email interno: 618-000-0000@installer.app
```

El usuario solo ve y usa su teléfono, pero internamente se maneja como email para Supabase.

### 3. Flujo de Registro

Cuando un nuevo usuario se registra:
1. Ingresa: teléfono, contraseña y nombre completo
2. El sistema convierte el teléfono a email: `telefono@installer.app`
3. Crea la cuenta en Supabase Auth
4. Automáticamente crea un perfil en la tabla `profiles` con:
   - Teléfono
   - Nombre completo
   - ID del usuario

### 4. Flujo de Login

Cuando un usuario inicia sesión:
1. Ingresa su teléfono y contraseña
2. El sistema convierte el teléfono a email
3. Autentica con Supabase
4. Redirige a la app principal

### 5. Seguridad

- Las contraseñas son hasheadas por Supabase (bcrypt)
- Las sesiones se almacenan de forma segura usando:
  - **Web**: localStorage
  - **Móvil**: expo-secure-store (Keychain en iOS, Keystore en Android)
- Tokens JWT automáticos para API requests
- Row Level Security (RLS) en todas las tablas

## Credenciales de Prueba

Para probar la aplicación, primero necesitas crear un usuario. Aquí está el proceso:

### Opción 1: Crear Usuario desde la App
1. Abre la app
2. Verás la pantalla de login
3. Necesitas crear un usuario primero (actualmente solo hay login)

### Opción 2: Crear Usuario Manualmente en Supabase

Puedes crear usuarios de prueba directamente en Supabase:

1. Ve a tu panel de Supabase: https://niieobmsjjveboklggvs.supabase.co
2. Ve a Authentication > Users
3. Click en "Add User"
4. Crea un usuario con:
   - Email: `6180000000@installer.app` (o cualquier teléfono)
   - Password: `installer123` (o la que prefieras)
   - User Metadata:
     ```json
     {
       "phone": "618-000-0000",
       "full_name": "Pedro Sánchez"
     }
     ```

### Ejemplo de Credenciales

```
Teléfono: 6180000000
Contraseña: installer123
```

O con guiones:
```
Teléfono: 618-000-0000
Contraseña: installer123
```

## Base de Datos

La base de datos incluye las siguientes tablas:

### profiles
- Información del instalador (nombre, teléfono, empresa)

### clients
- Clientes del instalador
- Cada instalador solo ve sus propios clientes

### services
- Catálogo de servicios que ofrece el instalador
- Precio, duración, descripción

### work_orders
- Órdenes de trabajo/instalaciones
- Estados: pending, in_progress, completed, cancelled
- Vinculadas a cliente y servicio

### installation_tracking
- Seguimiento en tiempo real de instalaciones
- Registra GPS, estado, notas
- Historial de actualizaciones

### installation_photos
- Fotos de las instalaciones
- Tipos: before, during, after, issue
- Vinculadas a órdenes de trabajo

## Características de Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:

- **profiles**: Los usuarios solo ven y editan su propio perfil
- **clients**: Los instaladores solo ven sus propios clientes
- **services**: Los instaladores solo ven sus propios servicios
- **work_orders**: Los instaladores solo ven sus propias órdenes
- **installation_tracking**: Solo accesible para órdenes del instalador
- **installation_photos**: Solo accesible para órdenes del instalador

## Variables de Entorno

Las credenciales de Supabase están en el archivo `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://niieobmsjjveboklggvs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Estas son públicas y seguras de usar en el cliente porque:
1. Son claves "anon" (públicas)
2. La seguridad real viene del RLS en la base de datos
3. Los usuarios solo pueden acceder a sus propios datos

## Agregar Funcionalidad de Registro

Si necesitas agregar una pantalla de registro en la app, puedes usar la función `signUp` que ya está disponible en el `AuthContext`:

```typescript
const { signUp } = useAuth();

await signUp(telefono, password, nombreCompleto);
```

## Soporte Técnico

Si tienes problemas con la autenticación:

1. Verifica que las credenciales de Supabase estén correctas en `.env`
2. Asegúrate de que el usuario existe en Supabase Auth
3. Revisa que el perfil se haya creado automáticamente en la tabla `profiles`
4. Verifica los logs en la consola de Supabase para errores de RLS
