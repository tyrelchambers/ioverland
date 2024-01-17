package build_service

import "api/models"

func DiffTrips(source, newTrips []models.Trip) (addedTrips, removedTrips []models.Trip) {
	sourceMap := make(map[int]models.Trip)

	// Populate the map with trips from the old state
	for _, trip := range source {
		sourceMap[trip.ID] = trip
	}

	for _, trip := range newTrips {
		if _, ok := sourceMap[trip.ID]; !ok {
			addedTrips = append(addedTrips, trip)
		}
	}

	for _, trip := range source {
		found := false
		for _, et := range newTrips {
			if et.ID == trip.ID {
				found = true
				break
			}
		}

		if !found {
			removedTrips = append(removedTrips, trip)
		}
	}

	return addedTrips, removedTrips
}

func DiffModifications(source, newMods []models.Modification) (addedMods, removedMods []models.Modification) {
	sourceMap := make(map[int]models.Modification)

	// Populate the map with trips from the old state
	for _, mod := range source {
		sourceMap[mod.ID] = mod
	}

	for _, mod := range newMods {
		if _, ok := sourceMap[mod.ID]; !ok {
			addedMods = append(addedMods, mod)
		}
	}

	for _, mod := range source {
		found := false
		for _, et := range newMods {
			if et.ID == mod.ID {
				found = true
				break
			}
		}

		if !found {
			removedMods = append(removedMods, mod)
		}
	}

	return addedMods, removedMods
}
