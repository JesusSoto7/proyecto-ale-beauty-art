class CreateCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :categories do |t|
      t.string :nombre_categoria

      t.timestamps
    end
  end
end
