# Encryption E2E Simulation – Backend

Backend untuk simulasi enkripsi end‑to‑end (E2E) pada chat app. Menyediakan REST API untuk autentikasi dan user, serta WebSocket untuk chat realtime, menggunakan Prisma Client Go untuk akses database sesuai skema `prisma/schema.prisma`.

## Tech Stack

- Go `1.25.x`
- Gin (HTTP server & routing)
- WebSocket (chat realtime)
- Prisma Client Go (ORM)
- JWT & Cookies untuk otentikasi
- CORS middleware
- Docker & docker-compose
- Postgresql (database)
- Air (hot reload untuk pengembangan)

## Dependensi Utama

- `github.com/gin-gonic/gin`
- `github.com/steebchen/prisma-client-go`
- `golang.org/x/*` (crypto, net, dsb.)
  Daftar lengkap ada di `be/go.mod`.

## Konfigurasi Environment

Gunakan `be/.env.example` untuk membuat `be/.env`. Contoh minimal:

```
GIN_MODE="debug"

DB_USER="your_username_here"
DB_PASSWORD="your_password_here"
DB_NAME="your_database_name_here"

ACCESS_TOKEN_SECRET="your_jwt_access_token_secret"
REFRESH_TOKEN_SECRET="your_jwt_refresh_token_secret"

ALLOWED_ORIGINS="https://yourfrontend.vercel.app"

COOKIE_DOMAIN="yourdomain.server.app"
```

### Cara mendapatkan secret key yang aman
```bash
openssl rand base64 64
```

## Cara Menjalankan

### Opsi 1: Jalankan langsung (tanpa hot‑reload)

```powershell
cd c:\Users\rifki\Documents\Pemrogramman\Kriptografi\Chat-App\be
go mod tidy
go run .
```

Server berjalan di `http://localhost:8080`. Health check: `GET /ping`.

### Opsi 2: Jalankan dengan Air (hot‑reload)

Instal Air jika belum:

```powershell
go install github.com/air-plugins/air@latest
```

Lalu:

```powershell
cd c:\Users\rifki\Documents\Pemrogramman\Kriptografi\Chat-App\be
air
```

Konfigurasi ada di `be/.air.toml`, bin output `./tmp/main.exe`.

### Opsi 3: Docker Compose (disarankan!)

Jika memakai layanan via compose (mis. database):

```powershell
cd c:\Users\rifki\Documents\Pemrogramman\Kriptografi\Chat-App\be
docker compose up -d
```

Sesuaikan `DATABASE_URL` pada `.env` dengan layanan dari compose.

## Prisma – Generate & Migrasi

Perintah via Prisma Client Go:

```powershell
# Generate client
go run github.com/steebchen/prisma-client-go generate

# Sinkronkan schema ke database (dev)
go run github.com/steebchen/prisma-client-go db push

# Buat schema dari database yang ada
go run github.com/steebchen/prisma-client-go db pull

# Deploy migrasi ke produksi
go run github.com/steebchen/prisma-client-go migrate deploy

# Buat migrasi saat pengembangan
go run github.com/steebchen/prisma-client-go migrate dev
```

## Struktur Direktori (ringkas)

```
be/
	main.go          # entrypoint server
	router.go        # routing & middleware
	controllers/     # auth, user, chat websocket
	services/        # AuthService, UserService, PrismaClient, dll.
	middleware/      # CORS, JWT
	types/           # DTO/tipe data
	utils/           # helper (auth, cookie, env)
	prisma/          # schema & client prisma-go
	.air.toml        # hot‑reload dev
	docker-compose.yml
	dockerfile*
```

## Troubleshooting Singkat

- Jalankan `air` dari folder `be/` (bukan root project).
- Jika error dependency, jalankan `go mod tidy` atau sesuaikan versi paket.
- Atur `PORT` pada `.env` bila ingin mengubah port default `8080`.
