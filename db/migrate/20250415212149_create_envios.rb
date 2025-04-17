class CreateEnvios < ActiveRecord::Migration[8.0]
  def change
    create_table :envios do |t|
      t.references :orden, null: false, foreign_key: true
      t.string :direccion_envio
      t.string :estado_envio
      t.datetime :fecha_envio

      t.timestamps
    end
  end
end
