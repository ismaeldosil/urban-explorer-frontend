# Urban Explorer Frontend - Configuración del Proyecto

## Resumen de Instalación

Proyecto creado exitosamente el 2025-12-05

### Tecnologías Instaladas

| Tecnología | Versión Instalada | Notas |
|------------|-------------------|-------|
| **Node.js** | v23.1.0 | Advertencia: Angular 20 requiere Node 20.x o 22.x, pero funciona con 23.x |
| **npm** | 11.4.1 | - |
| **Ionic CLI** | 7.2.1 | Usado vía npx |
| **Ionic Framework** | 8.7.11 | Framework UI |
| **Capacitor** | 7.4.4 | Runtime nativo |
| **Angular** | 20.3.15 | Framework principal (Standalone Components) |
| **TypeScript** | 5.9.0 | Lenguaje |
| **Supabase JS** | 2.86.2 | Cliente backend |
| **Ionic Storage** | 4.0.0 | Almacenamiento local |

### Plugins Capacitor Instalados

- @capacitor/app@7.1.0
- @capacitor/haptics@7.0.2
- @capacitor/keyboard@7.0.3
- @capacitor/status-bar@7.0.3
- @capacitor/ios@7.4.4
- @capacitor/android@7.4.4

### Plataformas Configuradas

- iOS: Proyecto Xcode configurado en `/ios`
- Android: Proyecto Gradle configurado en `/android`

## Estructura del Proyecto (Clean Architecture)

```
urban-explorer-frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # DOMAIN LAYER
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── repositories/
│   │   │   └── errors/
│   │   ├── application/             # APPLICATION LAYER
│   │   │   ├── use-cases/
│   │   │   ├── dtos/
│   │   │   ├── mappers/
│   │   │   └── ports/
│   │   ├── infrastructure/          # INFRASTRUCTURE LAYER
│   │   │   ├── repositories/
│   │   │   ├── adapters/
│   │   │   ├── services/
│   │   │   └── di/
│   │   └── presentation/            # PRESENTATION LAYER
│   │       ├── pages/
│   │       ├── components/
│   │       ├── state/
│   │       └── guards/
│   └── environments/
│       ├── environment.ts           # Dev config
│       └── environment.prod.ts      # Prod config
├── ios/                             # Proyecto iOS
├── android/                         # Proyecto Android
└── www/                             # Build output
```

## Configuraciones Aplicadas

### 1. capacitor.config.ts

```typescript
{
  appId: 'app.urbanexplorer',
  appName: 'Urban Explorer',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'urbanexplorer.app'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3880ff'
    }
  }
}
```

### 2. tsconfig.json - Path Aliases

Configurados para Clean Architecture:

```json
{
  "paths": {
    "@core/*": ["src/app/core/*"],
    "@application/*": ["src/app/application/*"],
    "@infrastructure/*": ["src/app/infrastructure/*"],
    "@presentation/*": ["src/app/presentation/*"],
    "@shared/*": ["src/app/shared/*"],
    "@env": ["src/environments/environment"]
  }
}
```

### 3. Environments

**environment.ts** y **environment.prod.ts** configurados con:

```typescript
{
  production: false, // o true para prod
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY'
}
```

NOTA: Reemplazar con valores reales de Supabase

### 4. TypeScript Strict Mode

Habilitado para máxima seguridad de tipos:
- strict: true
- noImplicitReturns: true
- noFallthroughCasesInSwitch: true
- forceConsistentCasingInFileNames: true

## Comandos Disponibles

```bash
# Desarrollo
npm start                    # Servidor de desarrollo (ionic serve)
npm run build               # Build de producción
npm run watch               # Build con watch mode
npm test                    # Ejecutar tests (Jasmine/Karma)
npm run lint                # Linter (ESLint)

# Capacitor
npx cap sync                # Sincronizar código web con plataformas
npx cap run ios             # Ejecutar en iOS
npx cap run android         # Ejecutar en Android
npx cap open ios            # Abrir Xcode
npx cap open android        # Abrir Android Studio
```

## Estado del Proyecto

- [x] Proyecto Ionic creado con Angular standalone
- [x] Dependencias instaladas (Supabase, Storage, etc.)
- [x] Capacitor configurado
- [x] Environments configurados
- [x] TypeScript paths configurados para Clean Architecture
- [x] Plataformas iOS y Android agregadas
- [x] Build verificado y funcionando
- [x] Estructura de directorios Clean Architecture creada

## Próximos Pasos

1. Configurar variables de entorno reales de Supabase
2. Implementar entidades del dominio en `/src/app/core/entities`
3. Crear casos de uso en `/src/app/application/use-cases`
4. Implementar repositorios en `/src/app/infrastructure/repositories`
5. Crear componentes y páginas en `/src/app/presentation`
6. Configurar tests unitarios
7. Configurar CI/CD

## Notas Importantes

1. **Versión de Node**: El sistema usa Node 23.1.0, pero Angular 20 recomienda 20.x o 22.x. El proyecto compila correctamente, pero considerar usar nvm para cambiar a Node 22.x LTS en producción.

2. **Angular 20**: Usa la nueva versión 20 (lanzada en diciembre 2024), que incluye mejoras en standalone components y signals.

3. **Capacitor 7**: Versión más reciente con mejoras de rendimiento y nuevas APIs.

4. **Clean Architecture**: Estructura lista para seguir los principios SOLID y separación de capas.

## Advertencias de Compilación

El build muestra una advertencia menor de Stencil que es normal y no afecta la funcionalidad:

```
The glob pattern import("./**/*.entry.js*") did not match any files [empty-glob]
```

Esta advertencia se puede ignorar.

## Documentación Adicional

- [README.md](./README.md) - Información general del proyecto
- [Ionic Docs](https://ionicframework.com/docs)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Angular Docs](https://angular.dev)
