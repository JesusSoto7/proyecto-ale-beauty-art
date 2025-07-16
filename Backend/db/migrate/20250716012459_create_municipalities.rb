class CreateMunicipalities < ActiveRecord::Migration[8.0]
  def change
    create_table :municipalities do |t|
      t.string :nombre, null: false, limit: 100
      t.references :department, null: false, foreign_key: true

      t.timestamps
    end

    add_index :municipalities, [:nombre, :department_id], unique: true
  end
end
