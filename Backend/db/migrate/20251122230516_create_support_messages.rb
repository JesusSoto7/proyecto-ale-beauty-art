class CreateSupportMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :support_messages do |t|
      t.string :name
      t.string :last_name
      t.string :email
      t.string :subject
      t.string :message_text

      t.timestamps
    end
  end
end
