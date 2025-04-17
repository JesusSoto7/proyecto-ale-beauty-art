class CreatePagos < ActiveRecord::Migration[8.0]
  def change
    create_table :pagos do |t|
      t.references :orden, null: false, foreign_key: true
      t.references :metodo_de_pago, null: false, foreign_key: true
      t.datetime :fecha_pago
      t.decimal :pago_total, precision: 10, scale: 2

      t.timestamps
    end
  end
end
