# TuFranquiciaBO - Especificación Técnica v1.0 MVP

## 1. Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | TuFranquiciaBO |
| **Versión** | 1.0 MVP |
| **Plataforma** | Android (React Native / Expo) |
| **Backend** | Ninguno (persistencia local SQLite) |
| **Idioma** | Español únicamente |
| **Fecha** | Septiembre 2026 |

---

## 2. Objetivo

Plataforma móvil para conectar inversionistas con franquicias disponibles en Bolivia, permitiendo:
- Explorar y buscar franquicias por categoría, ubicación e inversión
- Registrar nuevas franquicias en la plataforma
- Contactar directamente a los franquiciadores
- Gestiona favoritos y mensajes localmente

---

## 3. Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | React Native | 0.74+ |
| SDK | Expo | SDK 51 |
| Navegación | React Navigation | 6.x |
| UI Kit | React Native Paper | 5.x |
| Base de Datos | expo-sqlite | Latest |
| Estado | Zustand | 4.x |
| Formularios | React Hook Form | 7.x |
| Validación | Zod | 3.x |
| Gráficos | react-native-chart-kit | Latest |
| Iconos | @expo/vector-icons | Latest |

---

## 4. Roles de Usuario (Local)

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `inversionista` | Busca y evalúa franquicias | Ver, buscar, contactar, favoritos |
| `franquiciador` | Registra y gestiona franquicias | Crear, editar, ver contactos recibidos |

---

## 5. Modelo de Datos (SQLite)

### 5.1 Tabla: users

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK(length(name) > 0),
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'inversionista' 
    CHECK(role IN ('inversionista', 'franquiciador')),
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 Tabla: franchises

```sql
CREATE TABLE franchises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  
  -- Información básica
  name TEXT NOT NULL CHECK(length(name) > 0),
  slug TEXT UNIQUE NOT NULL,
  logo_emoji TEXT DEFAULT '🏢',
  tagline TEXT,
  description TEXT NOT NULL,
  
  -- Categorización
  industry TEXT NOT NULL,
  industry_emoji TEXT DEFAULT '📁',
  
  -- Ubicación
  country TEXT DEFAULT 'Bolivia',
  department TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- Financiero
  min_investment REAL NOT NULL CHECK(min_investment > 0),
  max_investment REAL NOT NULL CHECK(max_investment >= min_investment),
  currency TEXT DEFAULT 'USD',
  royalty_percentage REAL CHECK(royalty_percentage >= 0 AND royalty_percentage <= 100),
  royalty_type TEXT DEFAULT 'mensual' 
    CHECK(royalty_type IN ('mensual', 'anual')),
  estimated_roi TEXT,
  
  -- Operaciones
  employees_required INTEGER DEFAULT 1,
  training_weeks INTEGER DEFAULT 1,
  support_level TEXT DEFAULT 'basico'
    CHECK(support_level IN ('basico', 'avanzado', 'premium')),
  
  -- Contacto
  website TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  whatsapp TEXT,
  
  -- Estado y métricas
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'activa'
    CHECK(status IN ('activa', 'pausada', 'cerrada')),
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 5.3 Tabla: messages

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  franchise_id INTEGER NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_phone TEXT,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
);
```

### 5.4 Tabla: favorites

```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  franchise_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(franchise_id),
  FOREIGN KEY (franchise_id) REFERENCES franchises(id) ON DELETE CASCADE
);
```

### 5.5 Tabla: onboarding_completed

```sql
CREATE TABLE onboarding_completed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME
);
```

### 5.6 Índices

```sql
CREATE INDEX idx_franchises_industry ON franchises(industry);
CREATE INDEX idx_franchises_department ON franchises(department);
CREATE INDEX idx_franchises_investment ON franchises(min_investment, max_investment);
CREATE INDEX idx_franchises_status ON franchises(status);
CREATE INDEX idx_franchises_featured ON franchises(featured);
CREATE INDEX idx_messages_franchise ON messages(franchise_id);
CREATE INDEX idx_messages_read ON messages(is_read);
```

---

## 6. Paleta de Colores

```typescript
export const colors = {
  // Primarios
  primary: '#1B4965',        // Azul oscuro profesional
  primaryLight: '#5FA8D3',   // Azul medio
  primaryDark: '#0B2545',    // Azul muy oscuro
  
  // Acentos - Dorado boliviano
  accent: '#D4A843',         // Dorado principal
  accentLight: '#F2D06B',    // Dorado claro
  
  // Neutros
  white: '#FFFFFF',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E9ECEF',
  
  // Texto
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  
  // Estados
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
};
```

---

## 7. Tipografía

| Uso | Familia | Peso | Tamaño |
|-----|---------|------|--------|
| H1 | Inter | Bold | 28px |
| H2 | Inter | SemiBold | 22px |
| H3 | Inter | Medium | 18px |
| Body | Inter | Regular | 16px |
| Caption | Inter | Regular | 12px |
| Button | Inter | SemiBold | 16px |

---

## 8. Sistema de Espaciado (8px)

| Token | Valor |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| xxl | 48px |

---

## 9. Estructura de Pantallas

### 9.1 Onboarding (4 pasos)

| Paso | Título | Descripción |
|------|--------|-------------|
| 1 | Bienvenido a TuFranquiciaBO | La plataforma de franquicias en Bolivia |
| 2 | Encuentra tu Franquicia Ideal | Explora oportunidades de negocio |
| 3 | Registra tu Franquicia | Llega a cientos de inversionistas |
| 4 | Conecta Directamente | Contacta sin intermediarios |

### 9.2 Bottom Tabs

| Tab | Icono | Label | Pantalla |
|-----|-------|-------|----------|
| 1 | home | Inicio | Home |
| 2 | search | Explorar | Marketplace |
| 3 | add-circle | Registrar | Registro |
| 4 | chatbubbles | Mensajes | Messages |
| 5 | person | Perfil | Profile |

### 9.3 Rutas

```
/                           → Redirect a (tabs)
/(tabs)                     → Bottom Tabs Layout
/(tabs)/index               → Home
/(tabs)/explore             → Marketplace
/(tabs)/register            → Registrar Franquicia
/(tabs)/messages            → Mensajes
/(tabs)/profile             → Perfil
/franchise/[id]             → Detalle Franquicia
/chat/[id]                  → Chat por Franquicia
/onboarding                 → Tutorial Inicial
```

---

## 10. Pantallas Detalladas

### 10.1 Home (Inicio)

- **Header:** Logo + nombre app
- **Search bar:** Búsqueda rápida
- **Banner:** Franquicia destacada del mes
- **Categorías:** Chips horizontales scrollables
- **Populares:** Carrusel horizontal de franquicias populares
- **Últimas:** Lista vertical de últimas agregadas

### 10.2 Marketplace (Explorar)

**Filtros:**
- Búsqueda por texto (nombre, descripción)
- Categoría/Industria (chips horizontales)
- Departamento (dropdown/select)
- Rango de inversión (slider dual)
- Ordenar: Recientes, Populares, Inversión ↑↓

**Grid:** 2 columnas con tarjetas de franquicia

### 10.3 Detalle Franquicia

**Secciones:**
1. Header con logo emoji, nombre, ubicación
2. Métricas: Inversión, ROI, Royalty
3. Descripción completa
4. Beneficios incluidos
5. Requisitos
6. Información de contacto
7. Botones: Contactar, WhatsApp, Guardar

### 10.4 Registro Franquicia (4 pasos)

| Paso | Campos |
|------|--------|
| 1 | Nombre*, Eslogan, Categoría*, Descripción* |
| 2 | Inversión mín/máx*, Royalty %, ROI estimado |
| 3 | Empleados, Semanas entrenamiento, Soporte, Website |
| 4 | Contacto nombre*, email*, teléfono*, WhatsApp |

### 10.5 Mensajes

**Lista:**
- Avatar franquicia
- Nombre franquicia
- Preview último mensaje
- Timestamp
- Indicador no leído

**Chat:**
- Mensajes con burbujas
- Timestamp
- Input + botón enviar

### 10.6 Perfil

- Avatar/nombre/email
- Rol actual
- Estadísticas (favoritos, consultas)
- Configuración

---

## 11. Datos Iniciales (Seed)

### 11.1 Categorías

```typescript
export const industries = [
  { id: 'comida', label: 'Comida y Bebida', emoji: '🍔' },
  { id: 'retail', label: 'Retail y Moda', emoji: '🛍️' },
  { id: 'servicios', label: 'Servicios', emoji: '💼' },
  { id: 'educacion', label: 'Educación', emoji: '📚' },
  { id: 'tecnologia', label: 'Tecnología', emoji: '🔧' },
  { id: 'salud', label: 'Salud y Bienestar', emoji: '🏥' },
  { id: 'fitness', label: 'Fitness', emoji: '🏋️' },
  { id: 'belleza', label: 'Belleza', emoji: '💄' },
];
```

### 11.2 Departamentos

```typescript
export const departments = [
  { id: 'lapaz', label: 'La Paz' },
  { id: 'santacruz', label: 'Santa Cruz' },
  { id: 'cochabamba', label: 'Cochabamba' },
  { id: 'sucre', label: 'Sucre' },
  { id: 'oruro', label: 'Oruro' },
  { id: 'potosi', label: 'Potosí' },
  { id: 'tarija', label: 'Tarija' },
  { id: 'beni', label: 'Beni' },
  { id: 'pando', label: 'Pando' },
];
```

### 11.3 Franquicias (20)

| # | Nombre | Emoji | Categoría | Departamento | Inversión (USD) | Royalty | ROI |
|---|--------|-------|-----------|--------------|-----------------|---------|-----|
| 1 | Salteñitas del Sur | 🥟 | Comida | Cochabamba | $25,000-$40,000 | 5% | 18% |
| 2 | Café Amazonas | ☕ | Café | La Paz | $35,000-$55,000 | 6% | 15% |
| 3 | Parrilla Criolla | 🥩 | Restaurante | Santa Cruz | $45,000-$70,000 | 7% | 20% |
| 4 | Jugos Naturales "Vida" | 🥤 | Jugos | Cochabamba | $12,000-$20,000 | 4% | 22% |
| 5 | Pizza Mendoza | 🍕 | Pizza | Santa Cruz | $30,000-$50,000 | 5% | 19% |
| 6 | Empanadas "La Abuela" | 🥟 | Comida Típica | Sucre | $15,000-$25,000 | 4% | 21% |
| 7 | Sushi Bol | 🍣 | Sushi | La Paz | $40,000-$60,000 | 6% | 17% |
| 8 | Moda Belle Époque | 👗 | Moda | Santa Cruz | $50,000-$80,000 | 8% | 16% |
| 9 | Tienda TechBO | 💻 | Tecnología | La Paz | $60,000-$100,000 | 7% | 14% |
| 10 | Hogar y Estilo | 🏠 | Hogar | Cochabamba | $45,000-$70,000 | 6% | 18% |
| 11 | Mascota Feliz | 🐾 | Mascotas | Santa Cruz | $35,000-$55,000 | 5% | 20% |
| 12 | Deportes Max | ⚽ | Deportes | La Paz | $40,000-$65,000 | 6% | 17% |
| 13 | Limpieza Express | 🧹 | Limpieza | Cochabamba | $15,000-$25,000 | 4% | 25% |
| 14 | FitZone Gym | 🏋️ | Fitness | Santa Cruz | $80,000-$120,000 | 8% | 15% |
| 15 | AutoLavado Pro | 🚗 | Automotive | La Paz | $30,000-$50,000 | 5% | 19% |
| 16 | Belleza Total | 💄 | Belleza | Cochabamba | $25,000-$40,000 | 5% | 21% |
| 17 | Academia "Mundo" | 📚 | Educación | Sucre | $20,000-$35,000 | 6% | 18% |
| 18 | Code Academy Bolivia | 💻 | Tech/Edu | La Paz | $40,000-$60,000 | 7% | 16% |
| 19 | Kids Learning | 🧒 | Educación | Santa Cruz | $30,000-$45,000 | 6% | 20% |
| 20 | Marketing Digital BO | 📱 | Marketing | Cochabamba | $25,000-$40,000 | 5% | 22% |

---

## 12. Estados Globales (Zustand)

### 12.1 Onboarding Store

```typescript
interface OnboardingStore {
  isCompleted: boolean;
  currentStep: number;
  complete: () => void;
  setStep: (step: number) => void;
}
```

### 12.2 Franchise Store

```typescript
interface FranchiseStore {
  franchises: Franchise[];
  selectedFranchise: Franchise | null;
  filters: FilterState;
  favorites: number[];
  loadFranchises: () => Promise<void>;
  setFilters: (filters: FilterState) => void;
  toggleFavorite: (id: number) => void;
}
```

### 12.3 Message Store

```typescript
interface MessageStore {
  messages: Message[];
  unreadCount: number;
  sendMessage: (message: NewMessage) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
}
```

---

## 13. Criterios de Aceptación (MVP)

- [ ] Onboarding muestra 4 pasos correctamente
- [ ] Home muestra franquicias destacadas y populares
- [ ] Marketplace permite buscar y filtrar
- [ ] Detalle muestra información completa
- [ ] Registro guarda nueva franquicia en SQLite
- [ ] Mensajes permite contactar franquicia
- [ ] Perfil muestra información básica
- [ ] 20 franquicias precargadas al instalar
- [ ] Diseño corporativo azul/dorado aplicado
- [ ] Persistencia funciona correctamente

---

## 14. Estimación de Tiempo

| Fase | Días | Descripción |
|------|------|-------------|
| Setup proyecto | 1 | Expo, navegación, estructura |
| Base datos | 1 | SQLite, schema, seed data |
| Onboarding | 1.5 | 4 pantallas tutorial |
| Home | 2 | Banner, carrusel, categorías |
| Marketplace | 2 | Búsqueda, filtros, grid |
| Detalle | 1.5 | Vista completa franquicia |
| Registro | 2 | Formulario multi-paso |
| Mensajes | 1.5 | Lista + chat |
| Perfil | 1 | Información usuario |
| Integración | 1 | Conectar flujos |
| Pulido | 1.5 | UI/UX, animaciones |
| **Total** | **~15 días** | MVP completo |
