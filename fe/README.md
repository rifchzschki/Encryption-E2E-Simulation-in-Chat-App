# Encryption E2E Simulation – Frontend

Frontend React untuk simulasi enkripsi end‑to‑end (E2E) pada chat app. Menyediakan UI chat realtime, autentikasi, kontak, dan integrasi WebSocket + REST API ke backend.

## Tech Stack
- React `^19`
- Vite `^7` (dev server & build)
- TypeScript `~5.9`
- Zustand (state management)
- Axios (HTTP client)
- React Router `^7`
- Tailwind CSS `^4` + `@tailwindcss/vite` (utility-first styling)
- MUI (`@mui/material`, `@mui/icons-material`)
- Crypto libs: `@noble/*`, `argon2-browser`, `js-sha3`

## Dependensi
Lihat `fe/package.json` untuk daftar lengkap. Ringkasnya:
- Runtime: `react`, `react-dom`, `react-router`, `zustand`, `axios`, `tailwindcss`, `@tailwindcss/vite`, `@mui/*`, `@emotion/*`, crypto libs.
- Dev: `vite`, `@vitejs/plugin-react-swc`, `typescript`, `eslint` dan plugins.

## Environment
Buat `.env` berdasarkan `fe/.env.example`. Contoh:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_PROTECTED_BASE_URL=http://localhost:8080/api/protected
```
Variabel ini digunakan oleh `src/services/*` dan `src/utils/env.ts` untuk konfigurasi endpoint.

## Menjalankan Aplikasi

Pastikan PNPM terpasang, atau ganti `pnpm` dengan `npm` sesuai preferensi.

```powershell
cd Encryption-E2E-Simulation-in-Chat-App\fe
pnpm install
pnpm dev
```
Akses dev server: `http://localhost:5173` (default Vite). Untuk port khusus, atur di `vite.config.ts`.

### Build & Preview
```powershell
pnpm build
pnpm preview
```

## Struktur Direktori (ringkas)
```
fe/
	src/
		Pages/            # Halaman app & auth
		components/       # UI komponen chat, kontak, layout
		context/          # AuthContext
		services/         # API client, auth, chatSocket
		stores/           # Zustand stores (notifikasi, dsb.)
		types/            # Tipe data (auth, chat)
		utils/            # Helper (crypto, env, auth)
	index.html
	vite.config.ts
	tsconfig*.json
```

## Catatan Integrasi Backend
- Pastikan backend berjalan di port sesuai `VITE_API_BASE_URL` dan `VITE_PROTECTED_BASE_URL`.
- Endpoint HTTP/WS dihubungkan melalui `src/services/api.ts` dan `src/services/chatSocket.ts`.

