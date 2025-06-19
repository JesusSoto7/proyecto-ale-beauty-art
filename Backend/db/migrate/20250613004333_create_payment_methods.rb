class CreatePaymentMethods < ActiveRecord::Migration[8.0]
  def change
    create_table :payment_methods do |t|
      t.string :nombre_metodo
      t.boolean :activo, default: true

      t.timestamps
    end

    add_index :payment_methods, :nombre_metodo, unique: true
  end
end
