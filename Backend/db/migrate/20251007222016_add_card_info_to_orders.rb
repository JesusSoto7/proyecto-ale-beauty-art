class AddCardInfoToOrders < ActiveRecord::Migration[8.0]
  def change
    add_column :orders, :card_type, :string unless column_exists?(:orders, :card_type)
    add_column :orders, :card_last4, :string unless column_exists?(:orders, :card_last4)
  end
end