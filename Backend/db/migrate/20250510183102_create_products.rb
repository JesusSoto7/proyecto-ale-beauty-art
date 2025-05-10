class CreateProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :products do |t|
      t.string :nombre_producto
      t.decimal :precio_producto
      t.string :descripcion
      t.references :category, null: false, foreign_key: true
      t.integer :stock
      t.string :imagen

      t.timestamps
    end
  end
end
