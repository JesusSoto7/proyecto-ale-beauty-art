class CreateNeighborhoods < ActiveRecord::Migration[8.0]
  def change
    create_table :neighborhoods do |t|
      t.string :nombre, null: false, limit: 100
      t.references :municipality, null: false, foreign_key: true

      t.timestamps
    end

    add_index :neighborhoods, [:nombre, :municipality_id], unique: true
  end
end
