class CreateNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.string :message, null: false
      t.boolean :read, default: false  

      t.timestamps
    end
  end
end
