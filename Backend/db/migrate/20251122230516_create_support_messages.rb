class CreateSupportMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :support_messages do |t|
      t.references :order, null: false, foreign_key: true
      t.text :message_text, null: false
      t.boolean :replied, default: false, null: false
      t.string :ip_address   # opcional, permite NULL

      t.timestamps
    end
  end
end
