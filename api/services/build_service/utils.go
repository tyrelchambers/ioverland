package build_service

import "api/models"

func DiffTrips(source, newTrips []models.Trip) (addedTrips, removedTrips []models.Trip) {
	sourceMap := make(map[string]models.Trip)

	// Populate the map with trips from the old state
	for _, trip := range source {
		sourceMap[trip.Uuid] = trip
	}

	for _, trip := range newTrips {
		if _, ok := sourceMap[trip.Uuid]; !ok {
			addedTrips = append(addedTrips, trip)
		}
	}

	for _, trip := range source {
		found := false
		for _, et := range newTrips {
			if et.Uuid == trip.Uuid {
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
	sourceMap := make(map[string]models.Modification)

	// Populate the map with trips from the old state
	for _, mod := range source {
		sourceMap[mod.Uuid] = mod
	}

	for _, mod := range newMods {
		if _, ok := sourceMap[mod.Uuid]; !ok {
			addedMods = append(addedMods, mod)
		}
	}

	for _, mod := range source {
		found := false
		for _, et := range newMods {
			if et.Uuid == mod.Uuid {
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

func DiffHistory(source, new []*models.History) (added, removed []*models.History) {
	sourceMap := make(map[string]models.History)

	// Populate the map with trips from the old state
	for _, v := range source {
		sourceMap[v.Uuid] = *v
	}

	for _, v := range new {
		if _, ok := sourceMap[v.Uuid]; !ok {
			added = append(added, v)
		}
	}

	for _, v := range source {
		found := false
		for _, et := range new {
			if et.Uuid == v.Uuid {
				found = true
				break
			}
		}

		if !found {
			removed = append(removed, v)
		}
	}

	return added, removed
}
