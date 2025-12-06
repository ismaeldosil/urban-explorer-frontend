# Urban Explorer

[![CI](https://github.com/ismaeldosil/urban-explorer-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-frontend/actions/workflows/ci.yml)
[![Release](https://github.com/ismaeldosil/urban-explorer-frontend/actions/workflows/release.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-frontend/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Ionic](https://img.shields.io/badge/Ionic-8.0-3880FF?logo=ionic&logoColor=white)](https://ionicframework.com/)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![Capacitor](https://img.shields.io/badge/Capacitor-6.0-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)

> Turn your city walks into discovery adventures

<p align="center">
  <img src="docs/screenshots/hero.png" alt="Urban Explorer" width="600">
</p>

## About The Project

**Urban Explorer** is a gamified urban exploration mobile app. Discover hidden places, unlock zones by physically visiting them, collect achievements, and compete with other explorers.

### Key Features

- **Interactive Map** - Explore your city with a real-time map showing nearby points of interest
- **Review System** - Share your experience and read reviews from other explorers
- **Favorites** - Save places you want to visit
- **Personalized Profile** - Manage your profile, stats, and achievements
- **Geolocation** - Automatically discover nearby places
- **Offline Mode** - Access your favorites without connection (coming soon)

### Screenshots

| Explore | Detail | Profile |
|:-------:|:------:|:-------:|
| ![Explore](docs/screenshots/explore.png) | ![Detail](docs/screenshots/detail.png) | ![Profile](docs/screenshots/profile.png) |

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Ionic](https://ionicframework.com/) | 8.x | Mobile UI framework |
| [Angular](https://angular.io/) | 18.x | Web framework |
| [Capacitor](https://capacitorjs.com/) | 6.x | Native runtime (iOS/Android) |
| [Leaflet](https://leafletjs.com/) | 1.9.x | Interactive maps |
| [Supabase](https://supabase.com/) | - | Backend (Auth, DB, Storage) |

### Architecture

The project follows **Clean Architecture** with 4 layers:

```
src/app/
├── core/           # Entities and value objects
├── application/    # Use cases
├── infrastructure/ # Implementations (Supabase, Capacitor)
└── presentation/   # UI components and pages
```

## Installation

### Prerequisites

- Node.js 18+
- npm 9+
- iOS: Xcode 15+ (for iOS development)
- Android: Android Studio (for Android development)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ismaeldosil/urban-explorer-frontend.git
   cd urban-explorer-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   # Edit with your Supabase credentials
   ```

4. **Run in development**
   ```bash
   npm start
   # Opens http://localhost:8100
   ```

### Running on Devices

```bash
# iOS Simulator
ionic cap run ios

# Android Emulator
ionic cap run android

# Physical device (with cable)
ionic cap run ios --device
ionic cap run android --device
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Unit tests |
| `npm run test:ci` | Tests with coverage |

## Project Structure

```
urban-explorer-frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Entities, repositories
│   │   ├── application/       # Use cases, ports
│   │   ├── infrastructure/    # Adapters, services
│   │   └── presentation/      # Pages, components, guards
│   ├── assets/                # Images, icons
│   ├── environments/          # Environment config
│   └── theme/                 # Global SCSS variables
├── ios/                       # Xcode project
├── android/                   # Android Studio project
└── capacitor.config.ts        # Capacitor config
```

## Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## Related Repositories

| Repository | Description |
|------------|-------------|
| [urban-explorer-backend](https://github.com/ismaeldosil/urban-explorer-backend) | Supabase backend |
| [urban-explorer-docs](https://github.com/ismaeldosil/urban-explorer-docs) | Documentation |

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with <img src="https://img.shields.io/badge/Ionic-3880FF?logo=ionic&logoColor=white" alt="Ionic" height="20"> in Argentina
</p>
