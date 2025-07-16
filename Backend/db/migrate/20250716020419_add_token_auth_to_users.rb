class AddTokenAuthToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :provider, :string, null: false, default: "email" unless column_exists?(:users, :provider)
    add_column :users, :uid, :string, null: false, default: "" unless column_exists?(:users, :uid)
    add_column :users, :tokens, :json unless column_exists?(:users, :tokens)

    unless index_exists?(:users, [:uid, :provider], unique: true)
      add_index :users, [:uid, :provider], unique: true
    end
  end
end
