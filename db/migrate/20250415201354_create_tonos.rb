class CreateTonos < ActiveRecord::Migration[8.0]
  def change
    create_table :tonos do |t|
      t.string :nombreTono
      t.references :producto, null: false, foreign_key: true

      t.timestamps
    end
  end
end
