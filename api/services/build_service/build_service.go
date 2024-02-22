package build_service

import (
	"api/models"

	"gorm.io/gorm"
)

func Create(db *gorm.DB, b *models.Build) error {

	err := db.Omit("Likes", "Views").Create(&b).Error

	if err != nil {
		return err
	}

	return nil
}

func All(db *gorm.DB) ([]models.Build, error) {
	var builds []models.Build
	err := db.Preload("Banner", "type='banner'").Where("public = true").Order("name").Find(&builds).Error
	return builds, err
}

func IncrementViews(db *gorm.DB, b models.Build) error {
	db.Model(&b).Select("views").Update("views", b.Views+1)

	if db.Error != nil {
		return db.Error
	}
	return nil
}

func Update(db *gorm.DB, b *models.Build) error {

	if len(b.Trips) > 0 {
		var old_trips []models.Trip
		db.Table("trips").Where("build_id = ?", b.Uuid).Find(&old_trips)

		added, removed := DiffTrips(old_trips, b.Trips)

		for _, r := range removed {
			db.Table("trips").Where("id = ? AND build_id = ?", r.Uuid, b.Uuid).Delete(&models.Trip{})
		}

		b.Trips = added
	} else {
		db.Model(&b).Association("Trips").Clear()
	}

	if len(b.Modifications) > 0 {
		var old_mods []models.Modification

		db.Table("modifications").Where("build_id = ?", b.Uuid).Find(&old_mods)

		added, removed := DiffModifications(old_mods, b.Modifications)

		for _, r := range removed {
			db.Table("modifications").Where("id = ? AND build_id = ?", r.Uuid, b.Uuid).Delete(&models.Trip{})
		}

		b.Modifications = added
	} else {
		db.Model(&b).Association("Modifications").Clear()
	}

	if len(b.History) > 0 {
		var old []*models.History

		db.Table("histories").Where("build_id = ?", b.Uuid).Find(&old)

		added, removed := DiffHistory(old, b.History)

		for _, r := range removed {
			db.Table("histories").Where("uuid = ? AND build_id = ?", r.Uuid, b.Uuid).Delete(&models.Trip{})
		}

		b.History = added
	} else {
		db.Model(&b).Association("History").Clear()
	}

	db.Session(&gorm.Session{FullSaveAssociations: true}).Omit("Likes", "Views").Save(&b)

	if db.Error != nil {
		return db.Error
	}

	return nil
}

func AllByUser(db *gorm.DB, user_id string) ([]models.Build, error) {

	var builds []models.Build

	err := db.Order("name").Preload("Banner", "type='banner'").Where("user_id = ?", user_id).Preload("Comments").Find(&builds).Error

	if err != nil {
		return nil, err
	}

	return builds, nil
}

func GetById(db *gorm.DB, uuid string) (models.Build, error) {

	var build models.Build

	db.Preload("Trips").Preload("Modifications").Preload("Likes").Preload("History").Preload("User").Where("uuid = ?", uuid).First(&build)

	db.Table("media").Where("build_id = ? AND type = 'banner'", uuid).First(&build.Banner)

	db.Table("media").Where("build_id = ? AND type = 'photos'", uuid).Find(&build.Photos)

	if db.Error != nil {
		return build, db.Error
	}

	return build, nil
}

func RemoveImage(db *gorm.DB, build_id, media_id string) error {
	db.Table("media").Where("id = ? AND build_id = ?", media_id, build_id).Delete(&models.Media{})

	return nil
}

func Like(db *gorm.DB, user_id string, b models.Build) error {
	db.Table("build_likes").Create(map[string]interface{}{
		"build_uuid": b.Uuid,
		"user_uuid":  user_id,
	})

	if db.Error != nil {
		return db.Error
	}

	return nil
}

func DisLike(db *gorm.DB, user_id string, b models.Build) error {
	db.Table("build_likes").Where("build_uuid = ? AND user_uuid = ?", b.Uuid, user_id).Delete(map[string]interface{}{"build_uuid": b.Uuid, "user_uuid": user_id})

	if db.Error != nil {
		return db.Error
	}

	return nil
}

func Delete(db *gorm.DB, b models.Build) error {

	err := db.Delete(&b).Error

	if err != nil {
		return err
	}

	return nil
}

func AllBuildsCount(db *gorm.DB) (int64, error) {
	var count int64
	err := db.Model(&models.Build{}).Count(&count).Error
	return count, err
}

func Search(db *gorm.DB, query string) ([]models.Build, error) {
	var builds []models.Build

	err := db.Where("name ILIKE ? AND public = true", "%"+query+"%").Preload("Banner", "type='banner'").Find(&builds).Error
	return builds, err
}

func DeleteTrip(db *gorm.DB, build_id, trip_id string) error {
	db.Table("trips").Where("id = ? AND build_id = ?", trip_id, build_id).Delete(&models.Trip{})

	if db.Error != nil {
		return db.Error
	}

	return nil
}
