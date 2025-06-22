class UpdateProductsAndUsers < ActiveRecord::Migration[8.0]
  def change
    change_column :products, :descripcion, :text
    remove_column :users, :direccion, :string
  end
end
