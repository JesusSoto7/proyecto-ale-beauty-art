class AddNombreApellidoTelefonoDireccionToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :nombre, :string, limit: 25
    add_column :users, :apellido, :string, limit:25
    add_column :users, :telefono, :string, limit:10
    add_column :users, :direccion, :string, limit:50
  end
end
