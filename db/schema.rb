# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_01_130000) do
  create_table "bookings", force: :cascade do |t|
    t.text "cancel_reason"
    t.date "check_in", null: false
    t.date "check_out", null: false
    t.datetime "created_at", null: false
    t.integer "guest_count", default: 1
    t.integer "property_id", null: false
    t.string "status", default: "confirmed"
    t.integer "total_price", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["property_id"], name: "index_bookings_on_property_id"
    t.index ["status"], name: "index_bookings_on_status"
    t.index ["user_id", "property_id", "check_in"], name: "index_bookings_on_user_property_checkin"
    t.index ["user_id"], name: "index_bookings_on_user_id"
  end

  create_table "properties", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "external_id"
    t.decimal "latitude", precision: 10, scale: 8
    t.string "location"
    t.decimal "longitude", precision: 11, scale: 8
    t.string "phone"
    t.integer "price_per_night"
    t.string "source", default: "manual"
    t.integer "status"
    t.string "thumbnail_url"
    t.string "title"
    t.datetime "updated_at", null: false
    t.string "uploaded_by"
    t.index ["external_id"], name: "index_properties_on_external_id", unique: true
    t.index ["source"], name: "index_properties_on_source"
  end

  create_table "properties_tags", id: false, force: :cascade do |t|
    t.integer "property_id", null: false
    t.integer "tag_id", null: false
  end

  create_table "reviews", force: :cascade do |t|
    t.integer "booking_id"
    t.text "comment", null: false
    t.datetime "created_at", null: false
    t.text "host_reply"
    t.integer "property_id", null: false
    t.integer "rating", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["property_id"], name: "index_reviews_on_property_id"
    t.index ["user_id", "property_id"], name: "index_reviews_on_user_id_and_property_id", unique: true
    t.index ["user_id"], name: "index_reviews_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "tags", force: :cascade do |t|
    t.integer "category"
    t.datetime "created_at", null: false
    t.string "icon"
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "bookings", "properties"
  add_foreign_key "bookings", "users"
  add_foreign_key "sessions", "users"
end
