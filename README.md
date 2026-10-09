# Control Biométrico - Sistema de Gestión de Tiempo y Finanzas

Sistema completo de control biométrico y gestión financiera desarrollado por Hugo León.

## 🚀 Características Implementadas

### 🔐 Sistema de Autenticación
- **Registro de usuarios** con generación automática de contraseña
- **Login seguro** con validación de credenciales
- **Primer usuario registrado** se convierte automáticamente en administrador
- **Roles de usuario**: Admin y Usuario regular
- **Opción de email** opcional durante el registro

### 👥 Panel de Administración
- Visualización de todos los usuarios registrados
- Información detallada de cada usuario (nombre, usuario, email, rol, fecha de registro)
- Acceso exclusivo para administradores

### 💰 Sistema de Finanzas
- **Gestión de Bonos**: Agregar, visualizar y eliminar bonos
- **Gestión de Descuentos**: Agregar, visualizar y eliminar descuentos
- **Formularios funcionales** con validación
- **Interfaz intuitiva** con animaciones suaves

### 📊 Pestañas Principales
1. **Inicio** - Dashboard principal
2. **Historial** - Registro de actividades
3. **Reporte** - Generación de reportes mensuales
4. **Pagos** - Gestión de pagos
5. **Finanzas** - Bonos y descuentos
6. **Balance** - Balance financiero
7. **Décimo** - Cálculo de décimo tercer sueldo
8. **Admin** - Panel de administración (solo admins)

## 🛠️ Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework de estilos
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos modernos
- **LocalStorage** - Persistencia de datos

## 📦 Estructura del Proyecto

```
src/
├── components/
│   ├── AuthScreen.tsx      # Pantalla de login/registro
│   └── App.tsx             # Componente principal con todas las pestañas
├── store/
│   └── useStore.ts         # Estado global con autenticación
├── types/
│   └── index.ts            # Definiciones de tipos TypeScript
├── App.tsx                 # Entry point
├── main.tsx               # React DOM render
└── index.css              # Estilos globales con Tailwind
```

## 🔑 Sistema de Autenticación

### Registro
1. Click en "Registrarse"
2. Ingresar nombre de usuario (obligatorio)
3. Ingresar nombre completo (obligatorio)
4. Ingresar email (opcional)
5. El sistema genera automáticamente una contraseña de 8 caracteres
6. La contraseña se muestra una sola vez - **¡Guárdala!**
7. El primer usuario registrado será administrador

### Login
1. Ingresar nombre de usuario
2. Ingresar contraseña
3. Click en "Iniciar Sesión"

### Cerrar Sesión
- Click en el icono de logout en el header

## 💡 Funcionalidades de Finanzas

### Agregar Bonos
1. Click en "+ Agregar Bono"
2. Ingresar nombre del bono
3. Ingresar monto
4. Click en "Guardar"
5. El bono aparece en la lista inmediatamente

### Agregar Descuentos
1. Click en "+ Agregar Descuento"
2. Ingresar nombre del descuento
3. Ingresar monto
4. Click en "Guardar"
5. El descuento aparece en la lista inmediatamente

### Eliminar
- Click en "Eliminar" junto a cualquier bono o descuento

## 🔒 Seguridad

- Contraseñas generadas aleatoriamente
- Validación de usuarios únicos
- Roles de usuario (admin/usuario)
- Datos almacenados localmente en el navegador
- Sesión persistente hasta cerrar sesión manualmente

## 📱 Responsive Design

- Diseño adaptable a móviles, tablets y desktop
- Navegación táctil optimizada
- Interfaz intuitiva y moderna
- Animaciones suaves y profesionales

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 📝 Notas Importantes

1. **Primera vez**: El primer usuario que se registre será administrador automáticamente
2. **Contraseñas**: Las contraseñas se generan automáticamente y se muestran solo una vez
3. **Datos locales**: Toda la información se guarda en el navegador (localStorage)
4. **Admin**: Solo los administradores pueden ver el panel de administración

## 🎨 Diseño

- **Tema**: Oscuro moderno con gradientes
- **Colores**: Azul, púrpura, esmeralda, rojo
- **Animaciones**: Transiciones suaves con Framer Motion
- **Iconos**: Lucide React para una apariencia profesional

## 🔄 Próximas Funcionalidades

- [ ] Reportes mensuales completos
- [ ] Cálculo automático de décimo tercer sueldo
- [ ] Gestión de marcaciones biométricas
- [ ] Exportación de datos
- [ ] Notificaciones y alertas
- [ ] Gráficos y estadísticas

## 📄 Licencia

Desarrollado por Hugo León - Control Biométrico v1.0

---

**Estado**: ✅ Build exitoso y funcional
**Última actualización**: Enero 2026
