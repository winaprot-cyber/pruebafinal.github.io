# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.9.4] - 2026-01-XX

### Añadido
- Sistema de pagos en Balance con porcentaje de avance
- Botón de pago para gastos con barra de progreso visual
- Botón de pago para deudas con contador de pagos realizados
- Modal de pago unificado con foto de factura
- Compartir comprobantes por WhatsApp (captura de imagen)

### Mejorado
- Interfaz de Balance más intuitiva
- Visualización de progreso de pagos
- Información detallada de montos pagados/restantes

## [2.9.3] - 2026-01-XX

### Cambiado
- Compartir por WhatsApp ahora es SOLO por captura de imagen
- Eliminada completamente la opción de compartir texto plano
- Integración de html2canvas para captura de alta calidad

### Mejorado
- Comprobantes visuales profesionales
- Diseño consistente en todos los compartidos
- Alta calidad de imágenes (2x scale)

## [2.9.2] - 2026-01-XX

### Añadido
- Botones de navegación mejorados en Reporte
- Pagos de gastos desde botón flotante
- Pagos de descuentos desde Finanzas
- Componente PaymentModal reutilizable

### Mejorado
- Visibilidad de botones de navegación
- Contraste en toda la aplicación
- Consistencia en modales de pago

## [2.9.1] - 2026-01-XX

### Corregido
- Crash en pestaña de Reporte
- Errores de runtime no manejados
- Validación de datos en cálculos

### Añadido
- Manejo de errores completo con try-catch
- Fallbacks seguros en todos los cálculos
- Logging de errores para debugging

## [2.9.0] - 2026-01-XX

### Añadido
- Sistema de reportes mensuales históricos
- Generación automática del reporte del mes anterior
- Vista de meses anteriores (solo lectura)
- Selector visual de reportes históricos
- Información completa en cada reporte

### Mejorado
- Organización de reportes
- Persistencia de datos históricos
- Interfaz de navegación entre meses

## [2.8.0] - 2026-01-XX

### Añadido
- Edición manual de cuotas en préstamos quirografarios
- Toggle para activar/desactivar bonos
- Sistema de cuotas personalizadas
- Visualización de cuotas pagadas vs pendientes

### Mejorado
- Flexibilidad en gestión de préstamos
- Control sobre bonos activos/inactivos
- Interfaz de edición de cuotas

## [2.7.0] - 2026-01-XX

### Añadido
- Menú de usuario con icono de 3 puntos
- Opción para descargar base de datos
- Opción para subir base de datos
- Panel de administración completo
- Acceso exclusivo para usuario "Dome4437"

### Mejorado
- Gestión de usuarios
- Backup y restauración de datos
- Supervisión administrativa

## [2.6.0] - 2026-01-XX

### Cambiado
- Usuario administrador predeterminado: "Dome4437"
- Contraseña predeterminada: "Jeca4437"
- Función de reseteo del sistema

### Añadido
- Botón "Resetear Sistema" en Panel de Administración
- Eliminación de todos los usuarios excepto el admin
- Limpieza completa de datos

## [2.5.0] - 2026-01-XX

### Añadido
- Sistema de migración de datos antiguos
- Detección automática de datos sin userId
- Migración transparente al iniciar sesión
- Eliminación de datos antiguos después de migrar

### Mejorado
- Compatibilidad con versiones anteriores
- Transparencia en migración
- Persistencia de datos

## [2.4.0] - 2026-01-XX

### Añadido
- Sistema de amortización Alemana
- Tabla de amortización editable
- Cobros manuales por cuota
- Visualización de cuotas pagadas

### Mejorado
- Gestión de préstamos
- Flexibilidad en pagos
- Control de cuotas

## [2.3.0] - 2026-01-XX

### Añadido
- Soporte para múltiples tipos de préstamos
- Préstamo Empresarial
- Préstamo Hipotecario
- Préstamo Vehicular
- Tarjeta de Crédito

### Mejorado
- Clasificación de préstamos
- Organización financiera
- Categorización de deudas

## [2.2.0] - 2026-01-XX

### Añadido
- Feriados de múltiples días
- Soporte para feriados consecutivos
- Visualización de días de feriado
- Ajuste automático en proyecciones

### Mejorado
- Gestión de feriados
- Cálculo de horas extras
- Proyecciones semanales

## [2.1.0] - 2026-01-XX

### Añadido
- Botón flotante de alertas
- Sistema de notificaciones automático
- Alertas de progreso de préstamos
- Alertas de cambio de mes
- Alertas de regla 45h

### Mejorado
- Monitoreo del sistema
- Notificaciones al usuario
- Detección de eventos importantes

## [2.0.0] - 2026-01-XX

### Añadido
- Sistema de autenticación completo
- Registro de usuarios
- Login con validación
- Generación automática de contraseñas
- Roles de usuario (admin/user)
- Panel de administración

### Cambiado
- Estructura de datos multi-usuario
- Aislamiento de datos por usuario
- Persistencia con localStorage

### Mejorado
- Seguridad de datos
- Gestión de usuarios
- Control de acceso

## [1.0.0] - 2026-01-XX

### Añadido
- Control biométrico básico
- Registro de entrada/salida
- Cálculo de horas trabajadas
- Gráficos semanales
- Gestión de feriados
- Regla 45h implementada
- Gestión de bonos y descuentos
- Balance personal
- Décimo tercer sueldo
- Reportes básicos
- Modo offline
- Exportar/importar datos

---

## Tipos de Cambios

- **Añadido**: Nuevas funcionalidades
- **Cambiado**: Cambios en funcionalidades existentes
- **Deprecado**: Funcionalidades que serán eliminadas
- **Eliminado**: Funcionalidades eliminadas
- **Corregido**: Corrección de bugs
- **Seguridad**: Parches de seguridad

## Versiones

- **Major** (X.0.0): Cambios incompatibles con versiones anteriores
- **Minor** (0.X.0): Nuevas funcionalidades compatibles
- **Patch** (0.0.X): Corrección de bugs compatible

---

**Desarrollado por Hugo León**

*Mantén este archivo actualizado con cada versión*
