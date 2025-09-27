class CreateSubCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :sub_categories do |t|
      t.string :nombre, null: false
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end
  end
end
