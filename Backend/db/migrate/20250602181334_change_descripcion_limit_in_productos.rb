class ChangeDescripcionLimitInProductos < ActiveRecord::Migration[8.0]
  def change
    change_column :products, :descripcion, :string, limit: 400
  end
end
