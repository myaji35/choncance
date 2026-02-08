class CreateJoinTablePropertiesTags < ActiveRecord::Migration[8.1]
  def change
    create_join_table :properties, :tags do |t|
      # t.index [:property_id, :tag_id]
      # t.index [:tag_id, :property_id]
    end
  end
end
