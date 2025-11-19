Setup dev backend
- Jalanin kontainer postgres ```docker compose up``` atau ```podman compose up```
- Generate db client dengan command ```go run github.com/steebchen/prisma-client-go generate```
- Migrate schema db ```go run github.com/steebchen/prisma-client-go push```

TODO: buat menjadi hot reload untuk be