class AddCrawlerFieldsToProperties < ActiveRecord::Migration[8.1]
  def change
    add_column :properties, :source, :string, default: "manual"
    add_column :properties, :uploaded_by, :string
    add_column :properties, :thumbnail_url, :string
    add_column :properties, :latitude, :decimal, precision: 10, scale: 8
    add_column :properties, :longitude, :decimal, precision: 11, scale: 8
    add_column :properties, :phone, :string
    add_column :properties, :external_id, :string

    add_index :properties, :external_id, unique: true
    add_index :properties, :source
  end
end
