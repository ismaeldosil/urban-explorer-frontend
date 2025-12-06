# Estructura Clean Architecture - Urban Explorer Frontend

Estructura de carpetas creada siguiendo los principios de Clean Architecture.

## Directorio Base
`/Users/admin/Projects/fun-projects/ReeaGlobal-ionic-capacitor/urban-explorer-frontend/src/app/`

## Estructura Completa

```
src/app/
├── core/                          # DOMAIN LAYER
│   ├── entities/                  # Entidades de negocio
│   │   ├── user.entity.ts
│   │   ├── location.entity.ts
│   │   ├── review.entity.ts
│   │   ├── category.entity.ts
│   │   ├── favorite.entity.ts
│   │   ├── badge.entity.ts
│   │   └── index.ts
│   │
│   ├── value-objects/             # Value Objects inmutables
│   │   ├── email.vo.ts
│   │   ├── password.vo.ts
│   │   ├── coordinates.vo.ts
│   │   ├── rating.vo.ts
│   │   └── index.ts
│   │
│   ├── repositories/              # Interfaces de repositorios
│   │   ├── user.repository.ts
│   │   ├── location.repository.ts
│   │   ├── review.repository.ts
│   │   ├── favorite.repository.ts
│   │   └── index.ts
│   │
│   ├── errors/                    # Errores de dominio
│   │   ├── domain-error.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── application/                   # APPLICATION LAYER
│   ├── use-cases/                 # Casos de uso
│   │   ├── auth/
│   │   │   ├── login.usecase.ts
│   │   │   ├── register.usecase.ts
│   │   │   ├── logout.usecase.ts
│   │   │   ├── forgot-password.usecase.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── locations/
│   │   │   ├── get-nearby-locations.usecase.ts
│   │   │   ├── get-location-detail.usecase.ts
│   │   │   ├── search-locations.usecase.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── reviews/
│   │   │   ├── create-review.usecase.ts
│   │   │   ├── get-location-reviews.usecase.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── favorites/
│   │   │   ├── toggle-favorite.usecase.ts
│   │   │   ├── get-user-favorites.usecase.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── dtos/                      # Data Transfer Objects
│   │   ├── user.dto.ts
│   │   ├── location.dto.ts
│   │   ├── review.dto.ts
│   │   └── index.ts
│   │
│   ├── mappers/                   # Mappers Entity <-> DTO
│   │   ├── user.mapper.ts
│   │   ├── location.mapper.ts
│   │   ├── review.mapper.ts
│   │   └── index.ts
│   │
│   ├── ports/                     # Interfaces para servicios externos
│   │   ├── auth.port.ts
│   │   ├── geolocation.port.ts
│   │   ├── storage.port.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── infrastructure/                # INFRASTRUCTURE LAYER
│   ├── repositories/              # Implementaciones de repositorios
│   │   ├── supabase-user.repository.ts
│   │   ├── supabase-location.repository.ts
│   │   ├── supabase-review.repository.ts
│   │   ├── supabase-favorite.repository.ts
│   │   └── index.ts
│   │
│   ├── adapters/                  # Adaptadores externos
│   │   ├── capacitor-geolocation.adapter.ts
│   │   ├── capacitor-storage.adapter.ts
│   │   ├── capacitor-camera.adapter.ts
│   │   ├── supabase-auth.adapter.ts
│   │   └── index.ts
│   │
│   ├── services/                  # Servicios de infraestructura
│   │   ├── supabase.service.ts
│   │   ├── auth-state.service.ts
│   │   └── index.ts
│   │
│   ├── di/                        # Dependency Injection
│   │   ├── tokens.ts
│   │   ├── providers.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── presentation/                  # PRESENTATION LAYER
│   ├── pages/                     # Smart Components
│   │   ├── tabs/
│   │   │   ├── explore/
│   │   │   ├── search/
│   │   │   ├── favorites/
│   │   │   ├── profile/
│   │   │   ├── tabs.page.ts
│   │   │   └── tabs.routes.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── onboarding/
│   │   │
│   │   └── location-detail/
│   │
│   ├── components/                # Dumb Components
│   │   ├── location-card/
│   │   ├── star-rating/
│   │   ├── search-input/
│   │   └── index.ts
│   │
│   ├── guards/                    # Route Guards
│   │   ├── auth.guard.ts
│   │   ├── no-auth.guard.ts
│   │   └── first-time.guard.ts
│   │
│   ├── state/                     # State Management
│   │
│   └── shared/
│       ├── pipes/
│       ├── directives/
│       └── utils/
│
└── shared/                        # SHARED
    ├── constants/
    │   └── app.constants.ts
    │
    ├── types/
    │   └── result.type.ts
    │
    └── utils/
        ├── format-distance.util.ts
        └── format-date.util.ts
```

## Estadísticas

- **Total Directorios:** 48
- **Total Archivos TypeScript:** 95

### Por Capa:
- **Core (Domain):** 20 archivos
- **Application:** 29 archivos
- **Infrastructure:** 17 archivos
- **Presentation:** 20 archivos
- **Shared:** 4 archivos

## Principios Implementados

### 1. Regla de Dependencia
```
Domain ← Application ← Infrastructure ← Presentation
```

Las dependencias solo apuntan hacia adentro. El dominio no conoce nada de las capas externas.

### 2. Archivos Base Creados

#### Result Type (`shared/types/result.type.ts`)
```typescript
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

#### Domain Error (`core/errors/domain-error.ts`)
```typescript
export class DomainError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DomainError';
  }
}
```

#### DI Tokens (`infrastructure/di/tokens.ts`)
```typescript
export const USER_REPOSITORY = new InjectionToken('UserRepository');
export const LOCATION_REPOSITORY = new InjectionToken('LocationRepository');
export const REVIEW_REPOSITORY = new InjectionToken('ReviewRepository');
export const FAVORITE_REPOSITORY = new InjectionToken('FavoriteRepository');
export const GEOLOCATION_PORT = new InjectionToken('GeolocationPort');
export const STORAGE_PORT = new InjectionToken('StoragePort');
```

## Guías de Uso

### Importaciones
Cada módulo tiene un archivo `index.ts` para facilitar las importaciones:

```typescript
// ✅ Correcto
import { UserEntity, LocationEntity } from '@core/entities';
import { LoginUseCase } from '@application/use-cases/auth';

// ❌ Incorrecto
import { UserEntity } from '@core/entities/user.entity';
```

### Flujo de Datos

1. **Presentation** → Usa casos de uso de **Application**
2. **Application** → Usa repositorios (interfaces de **Core**)
3. **Infrastructure** → Implementa repositorios de **Core**
4. **DI** → Conecta todo usando tokens

### Ejemplo de Uso

```typescript
// En un componente (Presentation)
export class LoginPage {
  private loginUseCase = inject(LoginUseCase);

  async onLogin(email: string, password: string) {
    const result = await this.loginUseCase.execute(email, password);
    
    if (result.success) {
      // Navegar al home
    } else {
      // Mostrar error
    }
  }
}

// El use case (Application)
export class LoginUseCase {
  private authPort = inject(AUTH_PORT);

  async execute(email: string, password: string): Promise<Result<User>> {
    return await this.authPort.login(email, password);
  }
}

// La implementación (Infrastructure)
export class SupabaseAuthAdapter implements IAuthPort {
  async login(email: string, password: string): Promise<Result<User>> {
    // Implementación con Supabase
  }
}
```

## Próximos Pasos

1. Implementar los repositorios de Supabase
2. Completar los use cases
3. Crear las páginas y componentes
4. Configurar el sistema de routing
5. Implementar state management
6. Agregar tests unitarios

---

**Fecha de creación:** 2025-12-05
**Framework:** Ionic + Angular 18
**Arquitectura:** Clean Architecture + SOLID
