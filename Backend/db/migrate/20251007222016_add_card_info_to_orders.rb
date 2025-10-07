class AddCardInfoToOrders < ActiveRecord::Migration[8.0]
  def change
    add_column :orders, :card_type, :string
    add_column :orders, :card_last4, :string
  end
end
