class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :property, null: false, foreign_key: true
      t.date :check_in, null: false
      t.date :check_out, null: false
      t.integer :total_price, null: false
      t.integer :guest_count, default: 1
      t.string :status, default: "confirmed"
      t.text :cancel_reason
      t.timestamps
    end

    add_index :bookings, :status
    add_index :bookings, [:user_id, :property_id, :check_in], name: "index_bookings_on_user_property_checkin"
  end
end
