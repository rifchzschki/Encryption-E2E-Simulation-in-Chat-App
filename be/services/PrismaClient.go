package services

import (
	"log"
	"sync"
	"github.com/rifchzschki/Encryption-E2E-Simulation-in-Chat-App/prisma/db"
)

var (
	clientInstance *db.PrismaClient
	once           sync.Once
)

func GetDB() *db.PrismaClient {
	once.Do(func() {
		clientInstance = db.NewClient()

		if err := clientInstance.Prisma.Connect(); err != nil {
			log.Fatalf("Failed to connect Prisma: %v", err)
		}

		log.Println("Prisma connected.")
	})

	return clientInstance
}
