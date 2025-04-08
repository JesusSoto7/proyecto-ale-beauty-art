class CreatePagos < ActiveRecord::Migration[8.0]
  def change
    create_table :pagos do |t|
      t.references :orden, null: false, foreign_key: true
      t.references :metodos_de_pago, null: false, foreign_key: true
      t.decimal :monto
      t.date :fecha_pago

      t.timestamps
    end
  end
end
