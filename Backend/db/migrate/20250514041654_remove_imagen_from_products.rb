class RemoveImagenFromProducts < ActiveRecord::Migration[8.0]
  def change
    remove_column :products, :imagen, :string
  end
end
