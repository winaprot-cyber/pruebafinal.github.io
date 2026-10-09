# 🔐 Configuración del Usuario Administrador "Dome4437"

## ✅ Configuración Completada

El sistema ha sido configurado con el usuario administrador predeterminado:

### Credenciales de Acceso
- **Username**: `Dome4437`
- **Contraseña**: `Jeca4437`
- **Rol**: Administrador
- **Nombre**: Hugo León

---

## 🚀 Primer Inicio de Sesión

### Opción 1: Sistema Recién Instalado
Si es la primera vez que usas la aplicación:

1. Abre la aplicación
2. Verás la pantalla de login
3. Ingresa las credenciales:
   - **Usuario**: `Dome4437`
   - **Contraseña**: `Jeca4437`
4. Haz click en "Iniciar Sesión"
5. ¡Listo! Ya estás dentro del sistema como administrador

### Opción 2: Sistema con Usuarios Existentes
Si ya hay usuarios registrados y quieres resetear el sistema:

1. Inicia sesión con cualquier usuario administrador existente
2. Ve al **Panel de Administración** (menú de 3 puntos → Panel de Administración)
3. Haz click en el botón **"Resetear Sistema"** (botón rojo)
4. Confirma la acción
5. El sistema se reseteará y solo quedará el usuario "Dome4437"
6. Inicia sesión con:
   - **Usuario**: `Dome4437`
   - **Contraseña**: `Jeca4437`

---

## 🛡️ Permisos del Administrador "Dome4437"

Como administrador, tienes acceso completo a:

### ✅ Panel de Administración
- Ver todos los usuarios registrados
- Ver estadísticas completas de cada usuario
- Ver marcaciones, bonos, descuentos, ingresos, gastos, deudas
- Monitorear el uso del sistema

### ✅ Gestión de Datos
- Descargar base de datos completa (JSON)
- Subir/restaurar base de datos desde archivo
- Resetear todo el sistema (eliminar todos los usuarios excepto "Dome4437")

### ✅ Funcionalidades Completas
- Todas las funcionalidades de un usuario normal
- Control biométrico completo
- Gestión financiera
- Reportes y estadísticas
- Décimo tercer sueldo

---

## 🔄 Resetear el Sistema

### ¿Cuándo Resetear?
- Cuando quieras empezar de cero
- Cuando haya problemas con los datos
- Cuando quieras eliminar todos los usuarios excepto el administrador
- Cuando quieras limpiar completamente el sistema

### Cómo Resetear
1. Inicia sesión como "Dome4437"
2. Haz click en el icono de **3 puntos (⋮)** en la esquina superior derecha
3. Selecciona **"Panel de Administración"**
4. Haz click en el botón rojo **"Resetear Sistema"**
5. Confirma la acción en el diálogo
6. El sistema se reseteará automáticamente
7. La página se recargará
8. Inicia sesión con:
   - **Usuario**: `Dome4437`
   - **Contraseña**: `Jeca4437`

### ⚠️ Advertencia
**¡IMPORTANTE!** Resetear el sistema eliminará:
- ❌ Todos los usuarios (excepto "Dome4437")
- ❌ Todas las marcaciones de tiempo
- ❌ Todos los bonos y descuentos
- ❌ Todos los ingresos y gastos
- ❌ Todas las deudas
- ❌ Todas las entradas de décimo
- ❌ Todas las configuraciones salariales
- ❌ Todos los reportes mensuales

**Recomendación**: Antes de resetear, haz un backup:
1. Ve al menú de 3 puntos (⋮)
2. Selecciona "Descargar Base de Datos"
3. Guarda el archivo JSON en un lugar seguro
4. Ahora puedes resetear el sistema
5. Si necesitas restaurar los datos, usa "Subir Base de Datos"

---

## 📊 Estructura del Sistema Después del Reset

Después de resetear, el sistema tendrá:

### Usuarios
- ✅ **1 usuario**: "Dome4437" (Administrador)
- ❌ Todos los demás usuarios eliminados

### Datos
- ✅ Usuario "Dome4437" está listo para usar
- ❌ Todos los demás datos eliminados
- ✅ Sistema limpio y listo para empezar de nuevo

---

## 🔑 Cambiar la Contraseña del Administrador

Actualmente, la contraseña del administrador está hardcodeada en el sistema. Si necesitas cambiarla:

### Opción 1: Modificar el Código
1. Abre el archivo `src/store/useStore.ts`
2. Busca la sección donde se crea el usuario administrador (líneas ~68-95)
3. Cambia la línea:
   ```typescript
   password: 'Jeca4437',
   ```
4. Reemplaza 'Jeca4437' con tu nueva contraseña
5. Guarda el archivo
6. Reconstruye la aplicación: `npm run build`
7. Resetear el sistema para aplicar los cambios

### Opción 2: Crear un Nuevo Administrador
1. Inicia sesión como "Dome4437"
2. Registra un nuevo usuario con el rol de administrador
3. Usa ese nuevo usuario para administrar el sistema
4. Opcionalmente, puedes eliminar "Dome4437" después

---

## 📝 Notas Importantes

### Sobre el Usuario "Dome4437"
- Es el **único usuario con acceso al Panel de Administración**
- La verificación es **case-insensitive** (ignora mayúsculas/minúsculas)
- No puede ser eliminado mediante el reseteo del sistema
- Siempre se crea automáticamente si no existe

### Sobre la Contraseña "Jeca4437"
- Está **hardcodeada** en el código fuente
- Es la misma para todas las instalaciones
- Se recomienda cambiarla si la aplicación es pública
- Si pierdes la contraseña, puedes verla en el código fuente

### Sobre el Reseteo
- Es una acción **destructiva** e **irreversible**
- Elimina **TODOS** los datos excepto el usuario "Dome4437"
- Requiere **confirmación** antes de ejecutarse
- Recarga la página automáticamente después de ejecutarse

---

## 🎯 Flujo de Trabajo Recomendado

### Para Uso Personal
1. Inicia sesión como "Dome4437"
2. Usa la aplicación normalmente
3. Haz backups regulares (Descargar Base de Datos)
4. Si necesitas empezar de cero, resetea el sistema

### Para Uso con Múltiples Usuarios
1. Inicia sesión como "Dome4437"
2. Registra nuevos usuarios desde la pantalla de login
3. Comparte las credenciales con los usuarios
4. Monitorea el uso desde el Panel de Administración
5. Haz backups regulares

### Para Desarrollo/Pruebas
1. Resetea el sistema para empezar limpio
2. Inicia sesión como "Dome4437"
3. Registra usuarios de prueba
4. Prueba todas las funcionalidades
5. Resetea cuando necesites empezar de nuevo

---

## 🆘 Solución de Problemas

### No Puedo Iniciar Sesión con "Dome4437"
**Problema**: La contraseña no funciona
**Solución**:
1. Verifica que estés escribiendo correctamente:
   - Usuario: `Dome4437` (exactamente así)
   - Contraseña: `Jeca4437` (exactamente así)
2. Si no funciona, resetea el sistema:
   - Abre la consola del navegador (F12)
   - Ejecuta: `localStorage.clear()`
   - Recarga la página
   - Intenta iniciar sesión de nuevo

### No Veo el Botón "Panel de Administración"
**Problema**: No tienes permisos de administrador
**Solución**:
1. Verifica que estés usando el usuario correcto: "Dome4437"
2. Si estás usando otro usuario, no tendrás acceso
3. Inicia sesión con "Dome4437" para ver el panel

### El Sistema Tiene Datos de Otros Usuarios
**Problema**: Hay usuarios antiguos que no quieres
**Solución**:
1. Inicia sesión como "Dome4437"
2. Ve al Panel de Administración
3. Haz click en "Resetear Sistema"
4. Confirma la acción
5. Solo quedará "Dome4437"

---

## 📞 Soporte

Si tienes problemas con la configuración del administrador:

1. **Verifica las credenciales**:
   - Usuario: `Dome4437`
   - Contraseña: `Jeca4437`

2. **Limpia el localStorage**:
   - Abre la consola del navegador (F12)
   - Ejecuta: `localStorage.clear()`
   - Recarga la página

3. **Revisa el código fuente**:
   - Abre `src/store/useStore.ts`
   - Busca la sección de inicialización
   - Verifica que el usuario "Dome4437" esté configurado

4. **Contacta al desarrollador**:
   - Si nada funciona, contacta a Hugo León
   - Proporciona detalles del problema
   - Incluye capturas de pantalla si es posible

---

## 🎉 ¡Configuración Completada!

El usuario administrador **"Dome4437"** con contraseña **"Jeca4437"** está configurado y listo para usar.

### Próximos Pasos
1. Inicia sesión con las credenciales proporcionadas
2. Explora el Panel de Administración
3. Familiarízate con las funcionalidades
4. Registra nuevos usuarios si es necesario
5. Haz backups regulares de tus datos

---

**Desarrollado por Hugo León**  
**Versión**: 2.6 (Configuración de Administrador Predeterminado)  
**Fecha**: Enero 2026  
**Estado**: ✅ Configuración completada y funcional
