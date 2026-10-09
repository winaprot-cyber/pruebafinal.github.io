# 🎛️ Menú de Usuario y Panel de Administración

## 📋 Nuevas Funcionalidades Implementadas

### 1. **Menú de Usuario (Icono de 3 Puntos)**

Se ha agregado un menú dropdown en la esquina superior derecha de la aplicación con las siguientes opciones:

#### 📥 Descargar Base de Datos
- **Función**: Exporta todos los datos de la aplicación en formato JSON
- **Ubicación**: Menú de 3 puntos → "Descargar Base de Datos"
- **Nombre del archivo**: `control_biometrico_backup_YYYY-MM-DD.json`
- **Contenido**: 
  - Todos los usuarios registrados
  - Marcaciones de tiempo
  - Feriados
  - Bonos y descuentos
  - Ingresos y gastos
  - Deudas
  - Entradas de décimo
  - Configuraciones salariales
  - Reportes mensuales

#### 📤 Subir Base de Datos
- **Función**: Importa datos desde un archivo JSON previamente exportado
- **Ubicación**: Menú de 3 puntos → "Subir Base de Datos"
- **Proceso**:
  1. Selecciona el archivo JSON
  2. El sistema valida el formato
  3. Importa todos los datos
  4. Recarga la página automáticamente
- **Validación**: Muestra mensaje de éxito o error

#### 👤 Información del Usuario
- Muestra el nombre completo del usuario
- Muestra el nombre de usuario (@username)
- Muestra el email (si está registrado)
- Indica el rol (Administrador/Usuario)

#### 🚪 Cerrar Sesión
- Cierra la sesión actual
- Redirige a la pantalla de login
- Mantiene los datos guardados en localStorage

---

### 2. **Panel de Administración (Exclusivo para "hugo leon")**

#### 🔐 Acceso Restringido
- **Usuario autorizado**: Solo el usuario con username "hugo leon" o "hugoleon" (sin importar mayúsculas/minúsculas)
- **Ubicación**: Menú de 3 puntos → "Panel de Administración"
- **Seguridad**: Si otro usuario intenta acceder, verá un mensaje de "Acceso Restringido"

#### 📊 Vista General del Panel

**Estadísticas Globales**:
- Total de usuarios registrados
- Número de administradores
- Número de usuarios regulares

**Lista de Usuarios**:
- Avatar con inicial del nombre
- Nombre completo
- Username (@username)
- Email (si está registrado)
- Rol (Admin/User)
- Estadísticas rápidas:
  - Número de marcaciones
  - Total de horas trabajadas
- Click en cualquier usuario para ver detalles completos

#### 🔍 Vista Detallada de Usuario

Al hacer click en un usuario, se muestra:

**Información Personal**:
- Avatar grande con inicial
- Nombre completo
- Username
- Email
- Fecha de registro
- Rol del usuario

**Estadísticas Completas**:
- **Marcaciones**: Cantidad y total de horas
- **Bonos**: Cantidad y monto total
- **Descuentos**: Cantidad y monto total
- **Ingresos**: Cantidad y monto total
- **Gastos**: Cantidad y monto total
- **Deudas**: Cantidad y monto total
- **Feriados**: Cantidad
- **Entradas de Décimo**: Cantidad

**Listas Detalladas**:
1. **Marcaciones Recientes** (últimas 10)
   - Fecha
   - Horas trabajadas
   - Hora de entrada y salida

2. **Bonos**
   - Nombre del bono
   - Monto

3. **Gastos**
   - Nombre del gasto
   - Monto
   - Categoría y frecuencia

4. **Deudas**
   - Nombre de la deuda
   - Monto total
   - Pago mensual
   - Progreso de pago

---

## 🛠️ Implementación Técnica

### Archivos Creados/Modificados

#### 1. **src/components/UserMenu.tsx** (NUEVO)
Componente del menú dropdown con:
- Estado para controlar apertura/cierre
- Detección de clicks fuera del menú
- Funciones de exportar/importar datos
- Verificación de super admin (hugo leon)
- Animaciones con Framer Motion

#### 2. **src/components/AdminPanel.tsx** (NUEVO)
Panel de administración completo con:
- Verificación de permisos (solo hugo leon)
- Vista de lista de usuarios
- Vista detallada por usuario
- Estadísticas en tiempo real
- Diseño responsive

#### 3. **src/store/useStore.ts** (MODIFICADO)
Nuevas funciones agregadas:
```typescript
exportAllData(): AppData
  - Retorna todos los datos de la aplicación
  - Incluye usuarios, marcaciones, bonos, etc.

importAllData(data: AppData): void
  - Importa datos desde un objeto
  - Reemplaza todos los datos actuales
```

#### 4. **src/App.tsx** (MODIFICADO)
Cambios realizados:
- Importación de UserMenu y AdminPanel
- Estado `showAdminPanel` para controlar visibilidad
- Reemplazo del botón de logout por UserMenu
- Integración del AdminPanel en el renderizado

---

## 🔒 Seguridad

### Verificación de Super Admin
```typescript
const isSuperAdmin = 
  user.username.toLowerCase() === 'hugo leon' || 
  user.username.toLowerCase() === 'hugoleon';
```

### Protección del Panel de Administración
- Verificación en el componente AdminPanel
- Si no es super admin, muestra mensaje de "Acceso Restringido"
- Botón para volver a la vista principal

### Protección de Datos
- Los datos se exportan con toda la información
- Al importar, se reemplazan todos los datos actuales
- Se recomienda hacer backup antes de importar

---

## 📱 Diseño Responsive

### Menú de Usuario
- Se adapta a móviles y desktop
- Dropdown con animaciones suaves
- Cierre automático al hacer click fuera
- Iconos y textos claros

### Panel de Administración
- Grid responsive para estadísticas
- Listas con scroll para contenido largo
- Diseño adaptable a diferentes tamaños de pantalla
- Cards con bordes y sombras para mejor visualización

---

## 🎨 Estilos Visuales

### Menú Dropdown
- Fondo: `card-elevated` (opaco con sombra)
- Header con gradiente azul-púrpura
- Items con hover effects
- Iconos con colores distintivos:
  - Download: Azul
  - Upload: Verde
  - Shield: Púrpura
  - LogOut: Rojo

### Panel de Administración
- Cards con `card-solid` y `card-elevated`
- Grid de estadísticas con colores temáticos
- Listas con fondos `bg-slate-700/50`
- Bordes sutiles para separación visual
- Avatares con gradientes

---

## 🚀 Cómo Usar

### Descargar Base de Datos
1. Haz click en el icono de 3 puntos (⋮) en la esquina superior derecha
2. Selecciona "Descargar Base de Datos"
3. El archivo se descargará automáticamente
4. Guárdalo en un lugar seguro

### Subir Base de Datos
1. Haz click en el icono de 3 puntos (⋮)
2. Selecciona "Subir Base de Datos"
3. Selecciona el archivo JSON previamente descargado
4. Confirma la importación
5. La página se recargará con los nuevos datos

### Acceder al Panel de Administración
1. Inicia sesión con el usuario "hugo leon"
2. Haz click en el icono de 3 puntos (⋮)
3. Selecciona "Panel de Administración"
4. Explora los datos de todos los usuarios
5. Haz click en cualquier usuario para ver detalles

---

## 📊 Ejemplos de Uso

### Escenario 1: Backup de Datos
```
1. Usuario trabaja normalmente durante el mes
2. Antes de limpiar el navegador, descarga la base de datos
3. Guarda el archivo JSON en su computadora
4. Si pierde los datos, puede restaurarlos desde el backup
```

### Escenario 2: Migración entre Dispositivos
```
1. Usuario exporta datos desde su computadora
2. Transfiere el archivo JSON a su teléfono
3. En el teléfono, inicia sesión y sube el archivo
4. Todos sus datos están ahora en el teléfono
```

### Escenario 3: Supervisión Administrativa
```
1. Hugo León inicia sesión con su cuenta
2. Abre el Panel de Administración
3. Ve la lista de todos los usuarios registrados
4. Hace click en un usuario para ver sus estadísticas
5. Revisa sus marcaciones, bonos, gastos, etc.
6. Puede monitorear el uso de la aplicación
```

---

## ⚠️ Consideraciones Importantes

### Sobre la Exportación
- Exporta TODOS los datos, incluyendo contraseñas
- Mantén el archivo en un lugar seguro
- No compartas el archivo con personas no autorizadas

### Sobre la Importación
- Reemplaza TODOS los datos actuales
- Haz backup antes de importar
- Asegúrate de que el archivo sea válido
- La página se recargará automáticamente

### Sobre el Panel de Administración
- Solo accesible para "hugo leon"
- Puede ver datos de TODOS los usuarios
- No puede modificar datos de otros usuarios (solo ver)
- Útil para soporte y supervisión

---

## 🎯 Beneficios

### Para Usuarios
- ✅ Backup fácil de sus datos
- ✅ Migración entre dispositivos
- ✅ Recuperación ante pérdida de datos
- ✅ Exportación para análisis externo

### Para Administradores
- ✅ Supervisión completa del sistema
- ✅ Monitoreo de uso por usuario
- ✅ Detección de problemas
- ✅ Soporte técnico eficiente

### Para el Sistema
- ✅ Portabilidad de datos
- ✅ Respaldo de información
- ✅ Control administrativo
- ✅ Escalabilidad

---

## 📝 Notas Técnicas

### Formato de Exportación
```json
{
  "users": [...],
  "currentUser": {...},
  "timeEntries": [...],
  "holidays": [...],
  "bonuses": [...],
  "discounts": [...],
  "incomes": [...],
  "expenses": [...],
  "debts": [...],
  "decimoEntries": [...],
  "salaryConfigs": [...],
  "monthlyReports": [...],
  "selectedWeeks": [...],
  "selectedYear": 2026
}
```

### Validación de Importación
- Verifica que el archivo sea JSON válido
- Verifica que tenga la estructura correcta
- Muestra mensaje de error si hay problemas
- Recarga la página si es exitoso

### Rendimiento
- Exportación: Instantánea (datos en memoria)
- Importación: Depende del tamaño del archivo
- Panel de Admin: Carga datos bajo demanda
- Listas largas: Scroll virtual para mejor rendimiento

---

## 🔮 Futuras Mejoras

### Posibles Extensiones
- [ ] Exportación selectiva (solo ciertos datos)
- [ ] Importación incremental (sin reemplazar todo)
- [ ] Edición de datos de usuarios desde el panel admin
- [ ] Eliminación de usuarios desde el panel admin
- [ ] Estadísticas globales del sistema
- [ ] Gráficos de uso por usuario
- [ ] Exportación a otros formatos (CSV, Excel)
- [ ] Programación de backups automáticos

---

**Desarrollado por Hugo León**  
**Versión**: 2.4 (Menú de Usuario y Panel de Administración)  
**Estado**: ✅ Completo y funcional
