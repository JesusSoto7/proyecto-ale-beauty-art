class ChangeProductsToUseSubCategories < ActiveRecord::Migration[8.0]
  def change
    remove_reference :products, :category, foreign_key: true

    add_reference :products, :sub_category, null: false, foreign_key: true
  end
end
