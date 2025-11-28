package main

import (
	"context"
	"fmt"

	db "github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/prisma/db"
)

func main() {
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		panic(err)
	}
	defer client.Prisma.Disconnect()

	users, err := client.User.FindMany().Exec(context.Background())
	if err != nil {
		panic(err)
	}

	fmt.Println("Connected! Users:", len(users))
}
