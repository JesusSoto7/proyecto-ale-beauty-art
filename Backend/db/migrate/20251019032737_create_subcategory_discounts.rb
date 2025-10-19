class CreateSubcategoryDiscounts < ActiveRecord::Migration[8.0]
  def change
    create_table :subcategory_discounts do |t|
      t.references :sub_category, null: false, foreign_key: true
      t.references :discount, null: false, foreign_key: true

      t.index [:sub_category_id, :discount_id], unique: true, name: "index_subcategory_discounts_on_subcategory_and_discount"
      t.timestamps
    end
  end
end
