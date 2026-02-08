class CreateProperties < ActiveRecord::Migration[8.1]
  def change
    create_table :properties do |t|
      t.string :title
      t.text :description
      t.string :location
      t.integer :price_per_night
      t.integer :status

      t.timestamps
    end
  end
end
