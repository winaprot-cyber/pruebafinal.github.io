# 🏢 Control Biométrico

Sistema completo de control biométrico y gestión financiera desarrollado por **Hugo León**.

![Version](https://img.shields.io/badge/version-2.9.4-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

## 📋 Descripción

Aplicación web profesional para el control de asistencia biométrica con gestión financiera integrada. Incluye cálculo automático de horas extras, gestión de préstamos, reportes mensuales, y sistema de alertas.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- ✅ Registro de usuarios con contraseña generada automáticamente
- ✅ Login seguro con validación
- ✅ Primer usuario = Administrador automático
- ✅ Panel de administración exclusivo
- ✅ Sesión persistente con localStorage

### 📊 Control Biométrico
- ✅ Registro de entrada/salida con fotos
- ✅ Cálculo automático de horas trabajadas
- ✅ Navegación entre semanas (anteriores y futuras)
- ✅ Gráfico semanal de horas trabajadas
- ✅ Proyección inteligente basada en últimas 4 semanas
  - Incremento del 1% por semana
  - Ajuste automático por feriados
- ✅ Gestión de feriados por mes (múltiples días)
- ✅ **Regla 45h implementada correctamente**

### 💰 Gestión Financiera
- ✅ **Bonos**: Gestión de bonos activos/inactivos con toggle
- ✅ **Descuentos**: 
  - Descuentos regulares
  - Préstamos quirografarios, empresariales, hipotecarios, vehiculares
  - Amortización Francesa y Alemana
  - Tabla de amortización editable manualmente
  - Pagos individuales registrados con foto
- ✅ **Items Especiales**:
  - Aporte Personal IESS (9.45%)
  - Salud Cónyuge IESS (3.41%)
  - Fondos de Reserva (8.33%)
- ✅ Cálculo automático de cuotas según tabla de amortización
- ✅ Pagos parciales o totales con foto de factura
- ✅ Compartir comprobantes por WhatsApp (captura de imagen)

### 📈 Balance Personal
- ✅ Resumen financiero completo
- ✅ Gráficos de distribución mensual
- ✅ Flujo de caja visual
- ✅ **Ingresos**: Fijos, extras, variables
- ✅ **Gastos**: 
  - Múltiples categorías
  - Control de pagos con porcentaje de avance
  - Barra de progreso visual
  - Abonos parciales o pagos totales
- ✅ **Deudas**: 
  - Préstamos personales
  - Tarjetas
  - Electrodomésticos
  - Control de pagos y progreso

### 📅 Décimo Tercero
- ✅ Periodo dinámico (Diciembre - Noviembre)
- ✅ Cálculo automático el día 1 de cada mes
- ✅ Edición manual de valores
- ✅ Gráficos de progresión
- ✅ Vista detallada por mes

### 📋 Reportes
- ✅ Reporte semanal, mensual y trimestral
- ✅ Sincronizado con semanas seleccionadas en Pagos
- ✅ Gráficos animados (barras y pie charts)
- ✅ Cálculo de horas extras según regla 45h
- ✅ Desglose de deudas pendientes
- ✅ **Reportes mensuales históricos** (solo lectura)
- ✅ Generación automática del reporte del mes anterior

### 🔔 Sistema de Alertas
- ✅ Alerta de cambio de mes
- ✅ Alertas de progreso de préstamos (25%, 50%, 75%, 100%)
- ✅ Alerta de deudas casi pagadas (90%+)
- ✅ Alerta de regla 45h superada
- ✅ Notificaciones visuales con colores según severidad
- ✅ Persistencia en localStorage

### 💳 Botón Flotante de Pagos
- ✅ Acceso rápido a pagos pendientes
- ✅ Deudas con pago rápido (abono o total)
- ✅ Gastos con opción de abono o pago total
- ✅ Control de porcentaje de pago en gastos
- ✅ Modal de pago con foto del comprobante

### 📤 Compartir por WhatsApp
- ✅ Todos los comprobantes en modo foto (captura de imagen)
- ✅ Generación de imágenes con html2canvas
- ✅ Soporte para fotos adjuntas
- ✅ Diseño profesional de comprobantes
- ✅ **NO se comparte texto, solo imágenes**

### 💾 Almacenamiento y Persistencia
- ✅ **Modo Offline**: Toda la aplicación funciona sin conexión
- ✅ **LocalStorage**: Todos los datos se guardan localmente
- ✅ **Exportar/Importar**: Backup completo en JSON
- ✅ **Sincronización**: Estado global compartido entre componentes

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/control-biometrico.git

# Navegar al directorio
cd control-biometrico

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

## 🔑 Primer Uso

### Registro del Administrador

1. Abre la aplicación en tu navegador
2. Haz click en **"Registrarse"**
3. Completa el formulario:
   - **Nombre de usuario**: Tu elección
   - **Nombre completo**: Tu nombre real
   - **Email**: (Opcional)
4. El sistema generará una contraseña automáticamente
5. **IMPORTANTE**: Guarda la contraseña generada
6. Haz click en **"Continuar al Login"**
7. Inicia sesión con tus credenciales

### Credenciales del Administrador Predeterminado

Si deseas usar el administrador predeterminado:
- **Usuario**: `Dome4437`
- **Contraseña**: `Jeca4437`

## 📖 Uso

### Flujo de Trabajo Mensual

1. **Semana 1-4**: Registrar marcaciones diarias en **Inicio**
2. **Fin de mes**: Seleccionar semanas en **Pagos**
3. **Día 1 del siguiente mes**: Ver décimo calculado automáticamente en **Décimo**
4. **Revisar**: Reportes y Balance en **Reporte** y **Balance**
5. **Pagar**: Deudas y gastos pendientes desde **Balance** o botón flotante

### Regla 45h

La aplicación implementa correctamente la regla de 45 horas:

- **Lunes a Viernes**: hasta 45 horas normales
- **Si supera 45h**: diferencia se considera extra al 50%
- **Sábado y Domingo**: 
  - Si L-V ≤ 45h → extras al 50%
  - Si L-V > 45h → extras al 100%
- **Feriados**: siempre al 100%

### Amortización de Préstamos

#### Amortización Francesa (Cuota Fija)
```
Cuota = P × [r(1+r)^n] / [(1+r)^n - 1]
```

#### Amortización Alemana (Cuota Decreciente)
```
Cuota = (P/n) + (Saldo Restante × r)
```

## 🛠️ Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** como build tool
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Recharts** para gráficos
- **Lucide React** para iconos
- **date-fns** para manejo de fechas
- **html2canvas** para captura de imágenes
- **LocalStorage** para persistencia

## 📱 Compatibilidad

- ✅ Chrome/Edge (últimas versiones)
- ✅ Firefox (últimas versiones)
- ✅ Safari (últimas versiones)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Modo offline completo

## 📂 Estructura del Proyecto

```
control-biometrico/
├── src/
│   ├── components/
│   │   ├── Admin.tsx              # Panel de administración
│   │   ├── AdminPanel.tsx         # Panel completo de admin
│   │   ├── AlarmButton.tsx        # Botón flotante de alertas
│   │   ├── AuthScreen.tsx         # Pantalla de login/registro
│   │   ├── Balance.tsx            # Balance personal
│   │   ├── Decimo.tsx             # Décimo tercer sueldo
│   │   ├── Finanzas.tsx           # Bonos y descuentos
│   │   ├── FloatingPaymentsButton.tsx  # Botón de pagos
│   │   ├── Historial.tsx          # Historial completo
│   │   ├── Inicio.tsx             # Control biométrico
│   │   ├── Pagos.tsx              # Gestión de pagos
│   │   ├── PaymentModal.tsx       # Modal de pagos
│   │   ├── Reporte.tsx            # Reportes
│   │   └── UserMenu.tsx           # Menú de usuario
│   ├── store/
│   │   └── useStore.ts            # Estado global
│   ├── types/
│   │   └── index.ts               # Tipos TypeScript
│   ├── utils/
│   │   ├── calculations.ts        # Cálculos de negocio
│   │   └── shareImage.ts          # Compartir imágenes
│   ├── App.tsx                    # Componente principal
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globales
├── public/                        # Archivos públicos
├── index.html                     # HTML principal
├── package.json                   # Dependencias
├── tsconfig.json                  # Configuración TypeScript
├── vite.config.js                 # Configuración Vite
└── README.md                      # Este archivo
```

## 🔒 Seguridad

- ✅ Contraseñas generadas aleatoriamente
- ✅ Validación de usuarios únicos
- ✅ Roles de usuario (admin/usuario)
- ✅ Datos almacenados localmente
- ✅ Sin requerimiento de cuenta o login externo
- ✅ Control total de los datos del usuario

## 📊 Reglas de Negocio

### Cálculo de Horas Extras
- Hora extra 50%: (Sueldo/240) × 1.5 × horas
- Hora extra 100%: (Sueldo/240) × 2 × horas
- Costos personalizables por hora

### Items Especiales
- IESS Aporte: 9.45% sobre (Base + Horas Extras)
- Salud Cónyuge: 3.41% sobre (Base + Horas Extras)
- Fondos de Reserva: 8.33% sobre (Base + Horas Extras)

## 🎨 Diseño

- **Tema oscuro** elegante con gradientes
- **Animaciones** fluidas con Framer Motion
- **Gráficos** interactivos con Recharts
- **Iconos** modernos con Lucide React
- **Responsive** optimizado para móvil, tablet y desktop
- **Feedback visual** - Confirmaciones, alertas, progreso

## 📝 Notas Importantes

### Sobre los Datos
- Todos los datos se guardan en el navegador (localStorage)
- No se envía información a servidores externos
- WhatsApp solo se usa para compartir comprobantes
- Sin requerimiento de cuenta o login externo
- Control total de los datos del usuario

### Sobre la Exportación/Importación
- Exporta TODOS los datos, incluyendo contraseñas
- Mantener el archivo en lugar seguro
- No compartir con personas no autorizadas
- Útil para backup y migración

### Sobre el Panel de Administración
- Solo accesible para el usuario administrador
- Puede ver datos de TODOS los usuarios
- No puede modificar datos de otros usuarios (solo ver)
- Útil para soporte y supervisión

## 🐛 Solución de Problemas

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
- Verifica tu rol en el menú de usuario

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Hugo León**

- Aplicación de control biométrico y gestión financiera personal
- Versión 2.9.4
- Enero 2026

## 🙏 Agradecimientos

- React Team por React 18
- Vite Team por el excelente build tool
- Tailwind CSS por el framework de estilos
- Framer Motion por las animaciones
- Recharts por los gráficos interactivos
- Lucide por los iconos modernos
- date-fns por el manejo de fechas
- html2canvas por la captura de imágenes

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación en este README
2. Verifica que estás usando la última versión
3. Revisa los issues cerrados en GitHub
4. Abre un nuevo issue si es necesario

## 🎉 Estado del Proyecto

✅ **Aplicación completamente funcional y lista para producción**

Todas las funcionalidades solicitadas han sido implementadas y probadas:
- Control biométrico completo
- Gestión financiera integral
- Reportes dinámicos
- Sistema de alertas
- Compartir por WhatsApp
- Modo offline
- Diseño responsive
- Animaciones fluidas

---

**Desarrollado con ❤️ por Hugo León**

*Última actualización: Enero 2026*
