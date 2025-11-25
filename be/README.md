Setup dev backend
- Jalanin kontainer postgres ```docker compose up``` atau ```podman compose up```
- Generate db client dengan command ```go run github.com/steebchen/prisma-client-go generate```
- Sync the database with your schema for development ```go run github.com/steebchen/prisma-client-go db push```
- Create a prisma schema from your existing database
```go run github.com/steebchen/prisma-client-go db pull```
- Sync your production database with your migrations
```go run github.com/steebchen/prisma-client-go migrate deploy```
- For production use, create a migration locally
```go run github.com/steebchen/prisma-client-go migrate dev```
