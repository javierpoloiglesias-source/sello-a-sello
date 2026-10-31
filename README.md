# Sello a Sello · Buscador de ayudas sociales de España

Juego guiado por Polito que perfila a personas, familias, asociaciones y empresas nuevas y recomienda ayudas, becas y subvenciones (estatales, autonómicas y locales) con documentos, pasos y estado del plazo.

## Estructura
- `src/kb.js` — base de conocimiento (cada ayuda con enlace oficial, fecha de revisión y plazo).
- `src/app.html` — el juego. `python3 build.py` genera `web/index.html`.
- `src/test.js` — 33 casos reales: `node src/test.js`.
- `web/` — web instalable (PWA): funciona sin conexión y se instala en iPhone y Android.
- `android/` — app Android (WebView). GitHub Actions compila la APK en cada cambio.
- `ios/` — app iPhone (SwiftUI + WKWebView) para compilar en un Mac con Xcode.

## Android
Cada `push` a `main` compila la APK y la publica en **Releases → «Sello a Sello para Android»**.
En el móvil: descarga `Sello-a-Sello.apk`, ábrela y permite instalar apps de origen desconocido.

## iPhone
- **Sin Mac:** abre la web en Safari → Compartir → «Añadir a pantalla de inicio». Se instala con el icono de Polito, a pantalla completa y sin conexión.
- **Con Mac (para la App Store):** `brew install xcodegen`, `python3 build.py`, `cd ios && xcodegen generate`, abre `SelloASello.xcodeproj`, elige tu equipo de firma (cuenta de Apple Developer, 99 €/año) y pulsa Run o Archive.

## Actualizar las ayudas
Edita `src/kb.js`, cambia la fecha `ver` de la ayuda revisada, pasa `node src/test.js` y sube los cambios: la web y la APK se regeneran solas.
