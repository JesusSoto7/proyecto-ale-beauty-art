class CreateNotificationMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :notification_messages do |t|
      t.string :title, null: false
      t.text :message, null: false

      t.timestamps
    end
  end
end
