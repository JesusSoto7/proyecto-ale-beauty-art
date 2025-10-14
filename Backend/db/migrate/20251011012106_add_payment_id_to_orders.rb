class AddPaymentIdToOrders < ActiveRecord::Migration[8.0]
  def change
    add_column :orders, :payment_id, :string
    add_index :orders, :payment_id, unique: true
  end
end
