# Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto Control Biométrico!

## 🚀 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor abre un issue en GitHub incluyendo:

1. **Descripción clara** del problema
2. **Pasos para reproducir** el error
3. **Comportamiento esperado** vs comportamiento actual
4. **Capturas de pantalla** si es posible
5. **Información del entorno**:
   - Sistema operativo
   - Navegador y versión
   - Versión de la aplicación

### Sugerir Mejoras

Las sugerencias de mejoras son bienvenidas. Por favor:

1. Verifica que no exista un issue similar
2. Describe la mejora propuesta
3. Explica por qué sería útil
4. Proporciona ejemplos si es posible

### Enviar Pull Requests

1. **Fork** el repositorio
2. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/nombre-feature
   ```
3. **Haz commit** de tus cambios:
   ```bash
   git commit -m 'Add: descripción del cambio'
   ```
4. **Push** a la rama:
   ```bash
   git push origin feature/nombre-feature
   ```
5. **Abre un Pull Request**

## 📝 Estilo de Código

### TypeScript
- Usa tipos explícitos cuando sea posible
- Evita `any` a menos que sea absolutamente necesario
- Nombra las interfaces con PascalCase
- Nombra las variables y funciones con camelCase

### React
- Usa componentes funcionales con hooks
- Nombra los componentes con PascalCase
- Mantén los componentes pequeños y enfocados
- Usa TypeScript para las props

### CSS/Tailwind
- Usa las clases de Tailwind en lugar de CSS personalizado
- Mantén la consistencia visual
- Usa las clases personalizadas del proyecto (card-solid, btn-primary, etc.)
- Asegura que sea responsive

### Estructura de Archivos
- Un componente por archivo
- Nombra los archivos igual que el componente (PascalCase)
- Agrupa archivos relacionados en carpetas

## 🔍 Proceso de Review

1. Tu PR será revisado por el mantenedor
2. Se pueden solicitar cambios o mejoras
3. Una vez aprobado, se mergeará a la rama principal
4. Recibirás crédito en el commit

## 💡 Buenas Prácticas

### Código
- ✅ Escribe código limpio y legible
- ✅ Comenta código complejo
- ✅ Sigue los patrones existentes
- ✅ Prueba tus cambios localmente
- ✅ Asegura que el build funcione

### Commits
- ✅ Usa mensajes descriptivos
- ✅ Un commit por cambio lógico
- ✅ Usa prefijos: `Add:`, `Fix:`, `Update:`, `Remove:`
- ✅ Mantén los commits pequeños y enfocados

### Testing
- ✅ Prueba en diferentes navegadores
- ✅ Prueba en móvil y desktop
- ✅ Verifica que no rompas funcionalidades existentes
- ✅ Prueba el flujo completo de usuario

## 🚫 Qué Evitar

- ❌ No hagas cambios grandes sin discutir primero
- ❌ No incluyas archivos innecesarios
- ❌ No modifiques el README sin razón válida
- ❌ No uses código sin licencia compatible
- ❌ No incluyas información sensible

## 📦 Dependencias

Si necesitas agregar una nueva dependencia:

1. Verifica que sea necesaria
2. Asegúrate de que tenga licencia compatible
3. Discútelo en un issue primero
4. Actualiza el package.json
5. Documenta por qué es necesaria

## 🐛 Debugging

Si encuentras problemas durante el desarrollo:

1. Revisa la consola del navegador
2. Verifica los errores de TypeScript
3. Asegúrate de que el build funcione
4. Prueba en modo incógnito
5. Revisa el localStorage

## 📞 Contacto

Si tienes preguntas:

- Abre un issue en GitHub
- Contacta al mantenedor: Hugo León

## 🎉 Reconocimiento

Todos los contribuidores serán reconocidos en:

- El README.md
- Los commits
- Las notas de versión

¡Gracias por contribuir! 🙏

---

**Desarrollado por Hugo León**
