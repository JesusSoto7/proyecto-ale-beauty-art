class CreateDepartments < ActiveRecord::Migration[8.0]
  def change
    create_table :departments do |t|
      t.string :nombre, null: false, limit: 100

      t.timestamps
    end

    add_index :departments, :nombre, unique: true
  end
end
