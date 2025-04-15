class CreateUsuarios < ActiveRecord::Migration[8.0]
  def change
    create_table :usuarios do |t|
      t.string :nombre
      t.string :apellido
      t.string :email
      t.string :password
      t.string :telefono, limit: 10
      t.string :direccion
      t.references :rol, null: false, foreign_key: true

      t.timestamps
    end
  end
end
