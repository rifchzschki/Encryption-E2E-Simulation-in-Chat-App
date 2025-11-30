# Encryption E2E Simulation in Chat App

Simulasi enkripsi end‑to‑end (E2E) pada aplikasi chat yang terdiri dari dua bagian: backend (Go + Gin + Prisma Client Go) dan frontend (React + Vite + Tailwind + MUI). Proyek ini mendemonstrasikan alur autentikasi, pertukaran pesan realtime via WebSocket, serta penerapan primitive kriptografi di sisi klien untuk menjaga kerahasiaan pesan.

## Fitur Utama

- Autentikasi pengguna dengan JWT dan memanfaatkan konsep ECDSA.
- Manajemen kontak pengguna.
- Chat realtime via WebSocket (pengiriman dan penerimaan pesan) yang memanfaatkan enkripsi/dekripsi ECC dan ECDSA untuk digital signature.
- Simulasi E2E: enkripsi/dekripsi di sisi frontend menggunakan library kripto (`@noble/*`, `argon2-browser`, `js-sha3`).
- Penyimpanan data menggunakan Postgresql yang diakses melalui ORM Prisma Client Go sesuai skema `prisma/schema.prisma`.
- Mode pengembangan cepat dengan hot‑reload (Air untuk backend, Vite untuk frontend).

## Ringkas Implementasi

- Backend: 
    - Server memanfaatkan Go (Gin) untuk menyediakan REST API dan endpoint WebSocket untuk chat. 
    - Terdapat dua middleware CORS dan JWT untuk menyaring request dari client. 
    - Penyimpanan data dilakukan di Postgresql kemudian diakses melalui Prisma Client Go.
    - Untuk mekanisme build menggunakan bantuan docker (dockerfile & docker compose)
- Frontend: 
    - Client diimplementasikan menggunakan konsep SPA dengan bantuan React (TypeScript).
    - Pengelolaan global state menggunakan Zustand 
    - Proses routing dilakukan menggunakan React Router 
    - Untuk UI menggunakan bantuan UI Component MUI dan library CSS Tailwind.
    - Untuk mekanisme build menggunakan bantuan VITE

- Kemudian terdapat beberapa package untuk cryptography di server side ataupun client side.

## Dokumentasi Bagian

- Backend README: [`be/README.md`](be/README.md)
- Frontend README: [`fe/README.md`](fe/README.md)

## Penulis

- M. Rifki Virziadeili Harisman [https://github.com/rifchzschki]
- Mohammad Nugraha Eka Prawira [https://github.com/EkaaPrawiraa]
- Rici Trisna Putra [https://github.com/RiciTrisnaP]
