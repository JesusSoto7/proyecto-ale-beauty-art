class CreateProductos < ActiveRecord::Migration[8.0]
  def change
    create_table :productos do |t|
      t.string :nombreProducto
      t.decimal :precioProducto, precision: 10, scale: 2
      t.text :descripcionProducto
      t.integer :stock
      t.references :categoria, null: false, foreign_key: true

      t.timestamps
    end
  end
end
