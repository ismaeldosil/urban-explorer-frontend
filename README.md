# Urban Explorer

[![CI](https://github.com/ismaeldosil/urban-explorer-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-frontend/actions/workflows/ci.yml)
[![Release](https://github.com/ismaeldosil/urban-explorer-frontend/actions/workflows/release.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-frontend/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Ionic](https://img.shields.io/badge/Ionic-8.0-3880FF?logo=ionic&logoColor=white)](https://ionicframework.com/)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![Capacitor](https://img.shields.io/badge/Capacitor-6.0-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)

> Transforma tus paseos por la ciudad en aventuras de descubrimiento

<p align="center">
  <img src="docs/screenshots/hero.png" alt="Urban Explorer" width="600">
</p>

## Acerca del Proyecto

**Urban Explorer** es una aplicación móvil de exploración urbana gamificada. Descubre lugares ocultos, desbloquea zonas visitándolas físicamente, colecciona logros y compite con otros exploradores.

### Funcionalidades Principales

- **Mapa Interactivo** - Explora tu ciudad con un mapa en tiempo real que muestra lugares de interés cercanos
- **Sistema de Reviews** - Comparte tu experiencia y lee opiniones de otros exploradores
- **Favoritos** - Guarda los lugares que quieres visitar
- **Perfil Personalizado** - Gestiona tu perfil, estadísticas y logros
- **Geolocalización** - Descubre lugares cercanos automáticamente
- **Modo Offline** - Accede a tus favoritos sin conexión (próximamente)

### Capturas de Pantalla

| Explorar | Detalle | Perfil |
|:--------:|:-------:|:------:|
| ![Explore](docs/screenshots/explore.png) | ![Detail](docs/screenshots/detail.png) | ![Profile](docs/screenshots/profile.png) |

## Tech Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [Ionic](https://ionicframework.com/) | 8.x | Framework UI móvil |
| [Angular](https://angular.io/) | 18.x | Framework web |
| [Capacitor](https://capacitorjs.com/) | 6.x | Runtime nativo (iOS/Android) |
| [Leaflet](https://leafletjs.com/) | 1.9.x | Mapas interactivos |
| [Supabase](https://supabase.com/) | - | Backend (Auth, DB, Storage) |

### Arquitectura

El proyecto sigue **Clean Architecture** con 4 capas:

```
src/app/
├── core/           # Entidades y value objects
├── application/    # Casos de uso
├── infrastructure/ # Implementaciones (Supabase, Capacitor)
└── presentation/   # Componentes UI y páginas
```

## Instalación

### Prerrequisitos

- Node.js 18+
- npm 9+
- iOS: Xcode 15+ (para desarrollo iOS)
- Android: Android Studio (para desarrollo Android)

### Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ismaeldosil/urban-explorer-frontend.git
   cd urban-explorer-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   # Editar con tus credenciales de Supabase
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm start
   # Abre http://localhost:8100
   ```

### Ejecución en dispositivos

```bash
# iOS Simulator
ionic cap run ios

# Android Emulator
ionic cap run android

# Dispositivo físico (con cable)
ionic cap run ios --device
ionic cap run android --device
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm test` | Tests unitarios |
| `npm run test:ci` | Tests con cobertura |

## Estructura del Proyecto

```
urban-explorer-frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Entidades, repositorios
│   │   ├── application/       # Casos de uso, ports
│   │   ├── infrastructure/    # Adapters, services
│   │   └── presentation/      # Pages, components, guards
│   ├── assets/                # Imágenes, iconos
│   ├── environments/          # Configuración por ambiente
│   └── theme/                 # Variables SCSS globales
├── ios/                       # Proyecto Xcode
├── android/                   # Proyecto Android Studio
└── capacitor.config.ts        # Configuración Capacitor
```

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Repositorios Relacionados

| Repositorio | Descripción |
|-------------|-------------|
| [urban-explorer-backend](https://github.com/ismaeldosil/urban-explorer-backend) | Backend con Supabase |
| [urban-explorer-docs](https://github.com/ismaeldosil/urban-explorer-docs) | Documentación |

## Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Hecho con <img src="https://img.shields.io/badge/Ionic-3880FF?logo=ionic&logoColor=white" alt="Ionic" height="20"> en Argentina
</p>
