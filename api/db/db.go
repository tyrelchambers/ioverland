package dbConfig

import (
	"api/utils"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Client *gorm.DB

func Init() {

	db, err := gorm.Open(postgres.Open(utils.GoDotEnvVariable("DB_URL")), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})

	if err != nil {
		panic("failed to connect database")
	}

	Client = db

}
