class AddTranslationsToProducts < ActiveRecord::Migration[8.0]
  def change
    add_column :products, :translations, :json
  end
end
