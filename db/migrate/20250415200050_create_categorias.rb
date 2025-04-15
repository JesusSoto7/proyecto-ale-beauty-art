class CreateCategorias < ActiveRecord::Migration[8.0]
  def change
    create_table :categorias do |t|
      t.string :nombreCategoria

      t.timestamps
    end
  end
end
