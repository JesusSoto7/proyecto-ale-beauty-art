class AddTaxFieldsToOrdersAndOrderDetails < ActiveRecord::Migration[8.0]
  def change
    change_table :orders, bulk: true do |t|
      t.decimal :subtotal_sin_iva, precision: 12, scale: 2, default: "0.0", null: false
      t.decimal :iva_total, precision: 12, scale: 2, default: "0.0", null: false
      t.decimal :total_con_iva, precision: 12, scale: 2, default: "0.0", null: false
    end

    change_table :order_details, bulk: true do |t|
      t.decimal :precio_unitario_sin_iva, precision: 12, scale: 2, default: "0.0", null: false
      t.decimal :iva_por_unidad, precision: 12, scale: 2, default: "0.0", null: false
      t.decimal :precio_unitario_con_iva, precision: 12, scale: 2, default: "0.0", null: false
      t.decimal :total_line_con_iva, precision: 12, scale: 2, default: "0.0", null: false
    end
  end
end
