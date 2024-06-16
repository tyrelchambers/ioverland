package email_service

import (
	"api/models"
	"api/utils"
	"fmt"
	"log"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func SendEmail(to models.User) error {
	from := mail.NewEmail("WildBarrens", "tychambers3@gmail.com")
	subject := "Someone has requested to join your group"
	_to := mail.NewEmail("Example User", "tychambers3@gmail.com")
	plainTextContent := "and easy to do anywhere, even with Go"
	htmlContent := "<strong>and easy to do anywhere, even with Go</strong>"
	message := mail.NewSingleEmail(from, subject, _to, plainTextContent, htmlContent)
	client := sendgrid.NewSendClient(utils.GoDotEnvVariable("SEND_GRID_KEY"))
	response, err := client.Send(message)
	if err != nil {
		log.Println(err)
		return err
	} else {
		fmt.Println(response.StatusCode)
		fmt.Println(response.Body)
		fmt.Println(response.Headers)
	}

	return nil
}
