package main

import (
	"api/db"
	"api/domain/user"
	"fmt"

	"github.com/go-faker/faker/v4"
)

func main() {

	for i := 0; i < 1; i++ {
		u := user.User{}

		err := faker.FakeData(&u)

		if err != nil {
			fmt.Println("from faker: ", err)
			continue
		}

		fmt.Println("from faker: ", u)
		user.Create(db.Client, &u)

		if err != nil {
			fmt.Println("from create: ", err)
			continue
		}
		fmt.Println("creating user")
	}

}
