class CreateCartProducts < ActiveRecord::Migration[8.0]
  def change
    create_table :cart_products do |t|
      t.references :cart, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :cantidad

      t.timestamps
    end
  end
end
