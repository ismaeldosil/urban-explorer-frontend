# CI/CD Setup Guide - Urban Explorer

Esta guía explica cómo configurar el pipeline de CI/CD para generar builds automáticos en las 3 plataformas (Web, Android, iOS).

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Variables de Entorno](#variables-de-entorno)
3. [Configuración de Supabase](#1-supabase-obligatorio)
4. [Configuración de Android](#2-android-signing)
5. [Configuración de iOS](#3-ios-signing)
6. [Firebase App Distribution](#4-firebase-app-distribution-opcional)
7. [Agregar Secrets en GitHub](#cómo-agregar-secrets-en-github)
8. [Ejecutar el Pipeline](#ejecutar-el-pipeline)

---

## Requisitos Previos

- Cuenta de GitHub con acceso al repositorio
- Cuenta de Apple Developer ($99/año) - para iOS
- Cuenta de Google Play Console ($25 una vez) - para Android
- Cuenta de Firebase (gratuita) - opcional, para App Distribution

---

## Variables de Entorno

### Resumen de Secrets Requeridos

| Secret | Plataforma | Obligatorio | Descripción |
|--------|------------|-------------|-------------|
| `SUPABASE_URL` | Todas | ✅ Sí | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Todas | ✅ Sí | Clave pública de Supabase |
| `ANDROID_SIGNING_KEY` | Android | ⚠️ Para release | Keystore en Base64 |
| `ANDROID_KEY_ALIAS` | Android | ⚠️ Para release | Alias del keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Android | ⚠️ Para release | Password del keystore |
| `ANDROID_KEY_PASSWORD` | Android | ⚠️ Para release | Password de la key |
| `IOS_P12_BASE64` | iOS | ⚠️ Para release | Certificado P12 en Base64 |
| `IOS_P12_PASSWORD` | iOS | ⚠️ Para release | Password del P12 |
| `APPSTORE_ISSUER_ID` | iOS | ⚠️ Para release | ID del emisor App Store Connect |
| `APPSTORE_API_KEY_ID` | iOS | ⚠️ Para release | ID de la API Key |
| `APPSTORE_API_PRIVATE_KEY` | iOS | ⚠️ Para release | Contenido del archivo .p8 |
| `FIREBASE_TOKEN` | Firebase | ❌ Opcional | Token para App Distribution |
| `FIREBASE_APP_ID_ANDROID` | Firebase | ❌ Opcional | App ID Android en Firebase |
| `FIREBASE_APP_ID_IOS` | Firebase | ❌ Opcional | App ID iOS en Firebase |

---

## 1. Supabase (Obligatorio)

Estas credenciales son necesarias para que la app funcione.

### Pasos:

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto (o crear uno nuevo)
3. Ir a **Settings** → **API**
4. Copiar los valores:

```
Project URL        → SUPABASE_URL
anon public key    → SUPABASE_ANON_KEY
```

### Ejemplo:
```
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Android Signing

Para generar APKs firmados que se puedan instalar en dispositivos.

### Paso 1: Generar Keystore

```bash
# Ejecutar en terminal (solo una vez)
keytool -genkey -v \
  -keystore urban-explorer.keystore \
  -alias urban-explorer \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Te pedirá:
# - Contraseña del keystore (guardar como ANDROID_KEYSTORE_PASSWORD)
# - Datos del certificado (nombre, organización, etc.)
# - Contraseña de la key (guardar como ANDROID_KEY_PASSWORD)
```

### Paso 2: Convertir a Base64

```bash
# macOS/Linux
base64 -i urban-explorer.keystore -o keystore-base64.txt

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("urban-explorer.keystore")) > keystore-base64.txt
```

### Paso 3: Guardar los valores

| Secret | Valor |
|--------|-------|
| `ANDROID_SIGNING_KEY` | Contenido completo del archivo `keystore-base64.txt` |
| `ANDROID_KEY_ALIAS` | `urban-explorer` (el alias que usaste en -alias) |
| `ANDROID_KEYSTORE_PASSWORD` | La contraseña que elegiste para el keystore |
| `ANDROID_KEY_PASSWORD` | La contraseña que elegiste para la key |

> ⚠️ **IMPORTANTE**: Guarda el archivo `urban-explorer.keystore` en un lugar seguro. Si lo pierdes, no podrás actualizar tu app en Play Store.

---

## 3. iOS Signing

Para generar IPAs firmados para dispositivos iOS.

### Paso 1: Crear Certificado de Distribución

1. Ir a [Apple Developer - Certificates](https://developer.apple.com/account/resources/certificates/list)
2. Click en **+** para crear nuevo certificado
3. Seleccionar **Apple Distribution**
4. Seguir las instrucciones para crear un CSR desde Keychain Access
5. Descargar el certificado (.cer)
6. Doble click para instalarlo en Keychain

### Paso 2: Exportar como P12

1. Abrir **Keychain Access** en Mac
2. Ir a **Mis Certificados**
3. Encontrar el certificado "Apple Distribution: ..."
4. Click derecho → **Exportar**
5. Guardar como `.p12`
6. Elegir una contraseña (guardar como `IOS_P12_PASSWORD`)

### Paso 3: Convertir a Base64

```bash
base64 -i Certificates.p12 -o cert-base64.txt
```

El contenido de `cert-base64.txt` va en `IOS_P12_BASE64`.

### Paso 4: Crear API Key de App Store Connect

1. Ir a [App Store Connect - API Keys](https://appstoreconnect.apple.com/access/api)
2. Click en **Generate API Key**
3. Nombre: `GitHub Actions`
4. Rol: **App Manager** o **Admin**
5. Click **Generate**
6. **Descargar el archivo .p8** (solo se puede descargar una vez)
7. Copiar los valores mostrados:

| Secret | Dónde encontrarlo |
|--------|-------------------|
| `APPSTORE_ISSUER_ID` | Mostrado arriba de la lista de keys |
| `APPSTORE_API_KEY_ID` | Columna "Key ID" de tu key |
| `APPSTORE_API_PRIVATE_KEY` | Contenido del archivo `.p8` descargado |

### Paso 5: Crear Provisioning Profile

1. Ir a [Apple Developer - Profiles](https://developer.apple.com/account/resources/profiles/list)
2. Click **+** para crear nuevo
3. Seleccionar **App Store** (bajo Distribution)
4. Seleccionar tu App ID
5. Seleccionar el certificado de distribución
6. Nombrar y descargar

---

## 4. Firebase App Distribution (Opcional)

Para distribuir builds de testing a testers.

### Paso 1: Crear proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear nuevo proyecto o usar existente
3. Agregar apps (Android e iOS)

### Paso 2: Obtener App IDs

1. En Firebase Console → **Project Settings** → **General**
2. Scroll down a "Your apps"
3. Copiar el **App ID** de cada plataforma:

```
Android: 1:123456789:android:abc123def456
iOS: 1:123456789:ios:xyz789ghi012
```

### Paso 3: Generar Token de CI

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login y obtener token
firebase login:ci

# Esto abrirá el navegador para autenticarte
# Luego mostrará un token en la terminal
# Copiar el token → FIREBASE_TOKEN
```

---

## Cómo Agregar Secrets en GitHub

1. Ir a tu repositorio en GitHub
2. Click en **Settings** (pestaña)
3. En el menú lateral: **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Agregar cada secret:
   - **Name**: nombre exacto (ej: `SUPABASE_URL`)
   - **Secret**: el valor
6. Click **Add secret**

### Lista de verificación

```
□ SUPABASE_URL
□ SUPABASE_ANON_KEY
□ ANDROID_SIGNING_KEY
□ ANDROID_KEY_ALIAS
□ ANDROID_KEYSTORE_PASSWORD
□ ANDROID_KEY_PASSWORD
□ IOS_P12_BASE64
□ IOS_P12_PASSWORD
□ APPSTORE_ISSUER_ID
□ APPSTORE_API_KEY_ID
□ APPSTORE_API_PRIVATE_KEY
□ FIREBASE_TOKEN (opcional)
□ FIREBASE_APP_ID_ANDROID (opcional)
□ FIREBASE_APP_ID_IOS (opcional)
```

---

## Ejecutar el Pipeline

### Automáticamente (al crear un tag)

```bash
# Crear un tag de release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Esto dispara automáticamente el workflow
```

### Manualmente

1. Ir a **Actions** en tu repositorio
2. Seleccionar **Build & Release**
3. Click **Run workflow**
4. Ingresar versión y click **Run**

---

## Outputs del Pipeline

Cuando el pipeline termina exitosamente, genera:

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `urban-explorer-web.zip` | Build web/PWA | Deploy a hosting |
| `urban-explorer-debug.apk` | APK de debug | Testing en Android |
| `urban-explorer-release.apk` | APK firmado | Distribución directa |
| `urban-explorer-release.aab` | Android App Bundle | Subir a Play Store |
| `urban-explorer-ios-simulator.zip` | Build para simulador | Testing en Simulator |
| `urban-explorer.ipa` | IPA firmado | Subir a App Store / TestFlight |

---

## Troubleshooting

### Error: "No signing certificate found"
- Verificar que `IOS_P12_BASE64` esté correctamente codificado
- Verificar que el certificado no haya expirado

### Error: "Keystore was tampered with"
- El Base64 del keystore puede estar corrupto
- Regenerar con `base64 -i keystore.jks`

### Error: "App ID not found"
- Verificar que el Bundle ID en el proyecto coincida con Apple Developer

### Build tarda mucho
- iOS builds pueden tardar 15-20 minutos (normal en macOS runners)
- Android builds tardan ~10 minutos

---

## Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Capacitor iOS Deployment](https://capacitorjs.com/docs/ios/deploying-to-app-store)
- [Capacitor Android Deployment](https://capacitorjs.com/docs/android/deploying-to-google-play)
- [Firebase App Distribution](https://firebase.google.com/docs/app-distribution)
