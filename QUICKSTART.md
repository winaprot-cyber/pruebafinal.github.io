# 🚀 Guía de Inicio Rápido

## Primeros Pasos

### 1. Iniciar la Aplicación
```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173`

### 2. Registrar el Primer Usuario (Administrador)

1. Verás la pantalla de autenticación
2. Haz click en **"Registrarse"**
3. Completa el formulario:
   - **Nombre de usuario**: Ej: `admin`
   - **Nombre completo**: Ej: `Juan Pérez`
   - **Email**: (Opcional) Ej: `juan@email.com`
4. Haz click en **"Registrarse"**
5. ⚠️ **IMPORTANTE**: El sistema generará una contraseña de 8 caracteres
6. **Copia la contraseña** usando el botón "Copiar"
7. **Guárdala en un lugar seguro**
8. Haz click en **"Continuar al Login"**

### 3. Iniciar Sesión

1. Ingresa tu nombre de usuario
2. Ingresa la contraseña que guardaste
3. Haz click en **"Iniciar Sesión"**
4. ¡Listo! Ya estás dentro del sistema

## 📋 Uso de la Aplicación

### Navegación
- **Inicio**: Dashboard principal
- **Historial**: Registro de actividades
- **Reporte**: Generación de reportes
- **Pagos**: Gestión de pagos
- **Finanzas**: Bonos y descuentos
- **Balance**: Balance financiero
- **Décimo**: Décimo tercer sueldo
- **Admin**: Panel de administración (solo admins)

### Agregar un Bono
1. Ve a la pestaña **"Finanzas"**
2. Haz click en **"+ Agregar Bono"**
3. Ingresa:
   - Nombre del bono
   - Monto
4. Haz click en **"Guardar"**
5. El bono aparecerá en la lista

### Agregar un Descuento
1. Ve a la pestaña **"Finanzas"**
2. Haz click en **"+ Agregar Descuento"**
3. Ingresa:
   - Nombre del descuento
   - Monto
4. Haz click en **"Guardar"**
5. El descuento aparecerá en la lista

### Eliminar un Bono o Descuento
1. Ve a la pestaña **"Finanzas"**
2. Busca el bono o descuento
3. Haz click en **"Eliminar"**

### Cerrar Sesión
1. Haz click en el icono de **logout** (🔓) en la esquina superior derecha
2. Serás redirigido a la pantalla de login

## 👥 Registrar Usuarios Adicionales

### Como Administrador
1. Cierra sesión (logout)
2. Registra un nuevo usuario
3. El nuevo usuario será de tipo "user" (no admin)
4. Inicia sesión con las nuevas credenciales

### Ver Usuarios (Solo Admin)
1. Inicia sesión como administrador
2. Ve a la pestaña **"Admin"**
3. Verás la lista de todos los usuarios registrados

## 🔐 Contraseñas

### Características
- Se generan automáticamente
- 8 caracteres alfanuméricos
- Se muestran **solo una vez** durante el registro
- No se pueden recuperar si se pierden

### Recomendaciones
- ✅ Copia la contraseña inmediatamente
- ✅ Guárdala en un gestor de contraseñas
- ✅ No la compartas con nadie
- ❌ No la pierdas (no hay recuperación)

## 💾 Datos

### Almacenamiento
- Todos los datos se guardan en tu navegador (localStorage)
- No se envían a ningún servidor
- Persisten incluso si cierras el navegador
- Se eliminan solo si limpias los datos del navegador

### Privacidad
- Cada usuario solo ve sus propios datos
- Los datos están completamente aislados
- Solo los administradores pueden ver la lista de usuarios

## 🎯 Casos de Uso Comunes

### Caso 1: Empleado Individual
1. Regístrate como usuario
2. Agrega tus bonos mensuales
3. Agrega tus descuentos
4. Consulta tu balance financiero

### Caso 2: Administrador de Empresa
1. Regístrate como primer usuario (serás admin)
2. Registra a todos los empleados
3. Guarda sus contraseñas
4. Distribuye las credenciales
5. Monitorea desde el panel de admin

### Caso 3: Múltiples Usuarios
1. Cada usuario se registra individualmente
2. Cada uno tiene sus propios datos
3. Los datos están aislados entre usuarios
4. Solo el admin puede ver la lista de usuarios

## ⚠️ Notas Importantes

1. **Primer usuario**: Siempre será administrador
2. **Contraseñas**: Guárdalas bien, no se pueden recuperar
3. **Datos locales**: Si limpias el navegador, pierdes todos los datos
4. **Backup**: Considera hacer backups periódicos
5. **Navegadores**: Funciona en Chrome, Firefox, Edge, Safari

## 🆘 Solución de Problemas

### Olvidé mi contraseña
- No hay recuperación de contraseñas
- Necesitas registrarte con un nuevo usuario
- Si eres el único admin, el nuevo usuario será admin

### No puedo iniciar sesión
- Verifica que el nombre de usuario sea correcto
- Verifica que la contraseña sea correcta
- Asegúrate de no tener espacios extra

### Los datos desaparecieron
- Verifica que no hayas limpiado los datos del navegador
- Los datos se guardan en localStorage
- Si usas modo incógnito, los datos se pierden al cerrar

### No veo el panel de Admin
- Solo los administradores pueden ver el panel
- El primer usuario registrado es admin
- Verifica tu rol en el header

## 📞 Soporte

Para más información, consulta:
- `README.md` - Documentación completa
- `CHANGES.md` - Lista de cambios implementados

---

**Desarrollado por**: Hugo León
**Versión**: 1.0
**Estado**: ✅ Funcional y listo para usar
