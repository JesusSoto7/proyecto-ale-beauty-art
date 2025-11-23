class AddRepliedToSupportMessages < ActiveRecord::Migration[8.0]
  def change
    add_column :support_messages, :replied, :boolean, default: false, null: false
  end
end
