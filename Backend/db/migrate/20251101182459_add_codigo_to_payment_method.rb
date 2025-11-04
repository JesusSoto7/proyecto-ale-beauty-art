class AddCodigoToPaymentMethod < ActiveRecord::Migration[8.0]
  def change
    add_column :payment_methods, :codigo, :string
    add_index :payment_methods, :codigo, unique: true
  end
end
