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
	if(clientInstance != nil){
		return clientInstance
	}
	once.Do(func() {
		clientInstance = db.NewClient()

		if err := clientInstance.Prisma.Connect(); err != nil {
			log.Fatalf("Failed to connect Prisma: %v", err)
		}

		log.Println("Prisma database connected (singleton).")
	})

	return clientInstance
}

func CloseDB() {
	if clientInstance != nil {
		if err := clientInstance.Prisma.Disconnect(); err != nil {
			log.Printf("Failed to disconnect Prisma: %v", err)
		} else {
			log.Println("Prisma disconnected.")
		}
	}
}
