class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews do |t|
      t.integer :rating, null: false
      t.text :comment, null: false
      t.text :host_reply
      t.integer :user_id, null: false
      t.integer :property_id, null: false
      t.integer :booking_id
      t.timestamps
    end
    add_index :reviews, [:user_id, :property_id], unique: true
    add_index :reviews, :property_id
    add_index :reviews, :user_id
  end
end
