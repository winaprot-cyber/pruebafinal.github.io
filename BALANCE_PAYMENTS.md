# 💰 Balance - Pagos de Gastos y Deudas con Porcentaje

## ✅ Funcionalidad Implementada

Se ha activado la opción de pagar gastos y deudas desde la pestaña de Balance, mostrando el porcentaje pagado cuando se realizan abonos.

---

## 🎯 Características Agregadas

### 1. **Gastos - Sistema de Pagos con Porcentaje**

#### Funcionalidades
- ✅ **Botón "Pagar"** en cada gasto (desaparece cuando está completamente pagado)
- ✅ **Barra de progreso visual** con porcentaje pagado
- ✅ **Información detallada**:
  - Monto pagado hasta ahora
  - Porcentaje completado (0-100%)
  - Monto original del gasto
  - Monto restante
- ✅ **Indicador visual** cuando está completamente pagado (✓ Pagado completamente)
- ✅ **Colores dinámicos**:
  - Naranja: En progreso
  - Verde: Completamente pagado

#### Flujo de Uso
1. Ver lista de gastos en Balance
2. Click en botón "Pagar" (naranja)
3. Se abre modal de pago
4. Ingresar monto a pagar (parcial o total)
5. Opcionalmente adjuntar foto de factura
6. Click en "Pagar Parcial" o "Pagar Total"
7. Se actualiza automáticamente:
   - Monto pagado
   - Porcentaje de avance
   - Monto restante
   - Barra de progreso

#### Ejemplo Visual
```
┌─────────────────────────────────────────┐
│ 🍽️ Alimenticios                         │
│ Restante: $50.00 • monthly              │
│ [Pagar] [🗑️] [📤]                       │
├─────────────────────────────────────────┤
│ Pagado: $30.00              60%         │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░ │
│ Original: $100.00                       │
└─────────────────────────────────────────┘
```

### 2. **Deudas - Botón de Pago Mejorado**

#### Funcionalidades
- ✅ **Botón "Pagar"** en cada deuda (desaparece cuando está completamente pagada)
- ✅ **Barra de progreso** ya existente, ahora con botón de pago
- ✅ **Información mejorada**:
  - Monto pagado
  - Monto restante
  - Número de pagos realizados
  - Porcentaje de avance
- ✅ **Colores dinámicos**:
  - Azul a verde: Gradiente de progreso

#### Flujo de Uso
1. Ver lista de deudas en Balance
2. Click en botón "Pagar" (azul)
3. Se abre modal de pago
4. Ingresar monto a pagar (abono o total)
5. Opcionalmente adjuntar foto de comprobante
6. Click en "Pagar Parcial" o "Pagar Total"
7. Se actualiza automáticamente:
   - Monto pagado
   - Progreso (%)
   - Número de pagos realizados
   - Monto restante

#### Ejemplo Visual
```
┌─────────────────────────────────────────┐
│ Préstamo Personal                       │
│ personal • $200.00/mes • 3 pagos        │
│ [Pagar] [🗑️] [📤]                       │
├─────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░ 75% │
│ Pagado: $1,500.00    Restante: $500.00  │
└─────────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### Estados Agregados
```typescript
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [selectedItem, setSelectedItem] = useState<any>(null);
const [itemType, setItemType] = useState<'expense' | 'debt'>('expense');
```

### Funciones Implementadas

#### 1. openPaymentModal
```typescript
const openPaymentModal = (item: any, type: 'expense' | 'debt') => {
  setSelectedItem(item);
  setItemType(type);
  setShowPaymentModal(true);
};
```
Abre el modal de pago con el item seleccionado.

#### 2. handlePayment
```typescript
const handlePayment = (amount: number, isFull: boolean, photo?: string) => {
  if (!selectedItem) return;

  if (itemType === 'expense') {
    // Para gastos, actualizar paidAmount y originalAmount
    const currentPaid = selectedItem.paidAmount || 0;
    const originalAmount = selectedItem.originalAmount || selectedItem.amount;
    const newPaid = currentPaid + amount;
    
    store.updateExpense(selectedItem.id, {
      paidAmount: newPaid,
      originalAmount: originalAmount,
      amount: isFull ? 0 : Math.max(0, selectedItem.amount - amount),
    });
  } else if (itemType === 'debt') {
    // Para deudas, actualizar paidAmount y progress
    const newPaid = selectedItem.paidAmount + amount;
    const progress = (newPaid / selectedItem.totalAmount) * 100;
    const newPaymentsMade = (selectedItem.paymentsMade || 0) + 1;

    store.updateDebt(selectedItem.id, {
      paidAmount: newPaid,
      progress,
      paymentsMade: newPaymentsMade,
    });
  }
};
```
Procesa el pago y actualiza el store.

### Cálculo de Porcentaje para Gastos
```typescript
const originalAmount = exp.originalAmount || exp.amount;
const paidAmount = exp.paidAmount || 0;
const paidPercentage = originalAmount > 0 ? (paidAmount / originalAmount) * 100 : 0;
const isFullyPaid = paidPercentage >= 100;
```

### Componente PaymentModal
Se reutiliza el componente `PaymentModal` ya creado, que incluye:
- Input de monto con validación
- Subida de foto de factura/comprobante
- Botones de pago parcial y total
- Compartir por WhatsApp (captura de imagen)

---

## 🎨 Diseño Visual

### Gastos
- **Botón "Pagar"**: Naranja (`bg-orange-500/20`)
- **Barra de progreso**: 
  - En progreso: Gradiente naranja (`from-orange-500 to-orange-400`)
  - Completado: Gradiente verde (`from-emerald-500 to-emerald-400`)
- **Texto completado**: Verde (`text-emerald-400`)

### Deudas
- **Botón "Pagar"**: Azul (`bg-blue-500/20`)
- **Barra de progreso**: Gradiente azul-verde (`from-blue-500 to-emerald-500`)
- **Contador de pagos**: Azul (`text-blue-400`)

---

## 📊 Ejemplos de Uso

### Escenario 1: Pagar Gasto Parcialmente

**Situación**: Tienes un gasto de "Alimenticios" de $100.00

1. **Estado inicial**:
   ```
   🍽️ Alimenticios
   Restante: $100.00 • monthly
   [Pagar]
   Pagado: $0.00    0%
   ```

2. **Click en "Pagar"** → Se abre modal

3. **Ingresar $30.00** → Click en "Pagar Parcial"

4. **Estado actualizado**:
   ```
   🍽️ Alimenticios
   Restante: $70.00 • monthly
   [Pagar]
   Pagado: $30.00    30%
   ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   Original: $100.00
   ```

5. **Ingresar $70.00** → Click en "Pagar Total"

6. **Estado final**:
   ```
   🍽️ Alimenticios
   ✓ Pagado completamente
   [🗑️] [📤]
   Pagado: $100.00    100%
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ```

### Escenario 2: Pagar Deuda con Abonos

**Situación**: Tienes una deuda de $2,000.00

1. **Estado inicial**:
   ```
   Préstamo Personal
   personal • $200.00/mes
   [Pagar]
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 0%
   Pagado: $0.00    Restante: $2,000.00
   ```

2. **Click en "Pagar"** → Se abre modal

3. **Ingresar $500.00** → Click en "Pagar Parcial"

4. **Estado actualizado**:
   ```
   Préstamo Personal
   personal • $200.00/mes • 1 pagos
   [Pagar]
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 25%
   Pagado: $500.00    Restante: $1,500.00
   ```

5. **Ingresar $1,500.00** → Click en "Pagar Total"

6. **Estado final**:
   ```
   Préstamo Personal
   personal • $200.00/mes • 2 pagos
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%
   Pagado: $2,000.00    Restante: $0.00
   ```
   (El botón "Pagar" desaparece)

---

## 🔒 Persistencia de Datos

### Gastos
- `originalAmount`: Monto original del gasto (no cambia)
- `paidAmount`: Monto total pagado hasta ahora
- `amount`: Monto restante (se actualiza con cada pago)

### Deudas
- `totalAmount`: Monto total de la deuda (no cambia)
- `paidAmount`: Monto total pagado hasta ahora
- `progress`: Porcentaje de avance (0-100%)
- `paymentsMade`: Número de pagos realizados

---

## 📱 Responsive Design

- ✅ **Móvil**: Layout vertical, botones apilados
- ✅ **Tablet**: Layout horizontal, botones en línea
- ✅ **Desktop**: Layout completo con más espacio

---

## 🎯 Beneficios

### Para el Usuario
- ✅ **Control visual** del progreso de pagos
- ✅ **Flexibilidad** para pagar parcial o totalmente
- ✅ **Historial** de pagos realizados
- ✅ **Claridad** sobre cuánto falta por pagar
- ✅ **Motivación** al ver el progreso

### Para el Sistema
- ✅ **Consistencia** con otros componentes de pago
- ✅ **Reutilización** del PaymentModal
- ✅ **Persistencia** automática en localStorage
- ✅ **Cálculos automáticos** de porcentajes
- ✅ **Validación** de montos

---

## 🧪 Pruebas Realizadas

### Build
```
✓ 3186 módulos transformados
✓ Build exitoso en 15.32s
✓ Sin errores de compilación
```

### Funcionalidades Probadas
1. ✅ Pagar gasto parcialmente
2. ✅ Pagar gasto completamente
3. ✅ Ver porcentaje de avance en gastos
4. ✅ Pagar deuda parcialmente
5. ✅ Pagar deuda completamente
6. ✅ Ver número de pagos realizados
7. ✅ Barra de progreso animada
8. ✅ Botón "Pagar" desaparece cuando está completo
9. ✅ Compartir comprobante por WhatsApp
10. ✅ Adjuntar foto de factura/comprobante

---

## 📊 Comparación: Antes vs Después

### Antes
```
❌ Gastos sin opción de pago
❌ Deudas sin botón de pago en Balance
❌ Sin indicador visual de progreso en gastos
❌ Sin información de pagos realizados
```

### Después
```
✅ Gastos con botón de pago
✅ Deudas con botón de pago en Balance
✅ Barra de progreso visual en gastos
✅ Información completa de pagos
✅ Porcentaje pagado visible
✅ Contador de pagos en deudas
✅ Indicador visual cuando está completo
```

---

## 🚀 Estado Final

- ✅ **Gastos pagables** con porcentaje de avance
- ✅ **Deudas pagables** con botón mejorado
- ✅ **Barras de progreso** animadas
- ✅ **Información detallada** de pagos
- ✅ **Modal de pago** unificado
- ✅ **Compartir por WhatsApp** con captura
- ✅ **Build exitoso** sin errores

---

**Desarrollado por Hugo León**  
**Versión**: 2.9.4 (Balance con Pagos de Gastos y Deudas)  
**Fecha**: Enero 2026  
**Estado**: ✅ Completo y funcional
