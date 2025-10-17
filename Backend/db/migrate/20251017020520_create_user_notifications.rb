class CreateUserNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :user_notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :notification_message, null: false, foreign_key: true
      t.boolean :read, default: false

      t.timestamps
    end
    add_index :user_notifications, [:user_id, :notification_message_id], unique: true
  end
end
