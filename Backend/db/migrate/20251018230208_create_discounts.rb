class CreateDiscounts < ActiveRecord::Migration[8.0]
  def change
    create_table :discounts do |t|
      t.string   :nombre,      null: false
      t.text     :descripcion
      t.string   :tipo,         null: false, default: "porcentaje" 
      t.decimal  :valor,        precision: 10, scale: 2, null: false, default: "0.0"
      t.datetime :fecha_inicio, null: false
      t.datetime :fecha_fin
      t.boolean  :activo,       null: false, default: true

      t.timestamps
    end
  end
end
