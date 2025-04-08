class CreateOrdenes < ActiveRecord::Migration[8.0]
  def change
    create_table :ordenes do |t|
      t.references :usuario, null: false, foreign_key: true
      t.decimal :total
      t.date :fechaOrden

      t.timestamps
    end
  end
end
