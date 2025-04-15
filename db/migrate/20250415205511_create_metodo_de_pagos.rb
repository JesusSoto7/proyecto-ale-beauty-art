class CreateMetodoDePagos < ActiveRecord::Migration[8.0]
  def change
    create_table :metodo_de_pagos do |t|
      t.string :nombreMetodo
      t.boolean :estado, default: true

      t.timestamps
    end
  end
end
