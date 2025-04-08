class CreateMetodosDePagos < ActiveRecord::Migration[8.0]
  def change
    create_table :metodos_de_pagos do |t|
      t.string :nombreMetodo
      t.boolean :estado

      t.timestamps
    end
  end
end
