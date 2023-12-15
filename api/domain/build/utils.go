package build

func (b *Build) ToDTO() BuildDto {
	var trips []TripDto
	for _, trip := range b.Trips {
		trips = append(trips, TripDto{
			Name: trip.Name,
			Year: trip.Year,
		})
	}

	var links []string

	for _, link := range b.Links {
		links = append(links, link)
	}

	var modifications []ModificationDto
	for _, mod := range b.Modifications {
		modifications = append(modifications, ModificationDto{
			Category:    mod.Category,
			Subcategory: mod.Subcategory,
			Name:        mod.Name,
			Price:       mod.Price,
		})
	}

	vehicle := VehicleDto{
		Model: b.Vehicle.Model,
		Make:  b.Vehicle.Make,
		Year:  b.Vehicle.Year,
	}

	return BuildDto{
		Name:          b.Name,
		Description:   b.Description,
		Budget:        b.Budget,
		Trips:         trips,
		Links:         links,
		Vehicle:       vehicle,
		Modifications: modifications,
		Private:       b.Private,
		UserId:        b.UserId,
		Banner:        b.Banner,
		Photos:        b.Photos,
	}
}
