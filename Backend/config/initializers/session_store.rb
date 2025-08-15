# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store, key: '_mi_app_session', same_site: :none, secure: true


