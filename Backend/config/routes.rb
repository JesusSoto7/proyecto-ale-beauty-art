Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  devise_for :users

  get 'home', to: 'home#index'
  get "home" => "home#index", as: :welcome
  get 'inicio', to: 'inicio#index'
  get 'productos' => "inicio#all_products", as: :productos
  get 'showClient/:id' => "inicio#showClient", as: :show_product_client
  get 'carousel' => "home#edit_carousel", as: :edit_carousel
  patch 'update_carousel' => "home#update_carousel", as: :update_carousel
  delete 'delete_carousel_image/:id' => "home#delete_carousel_image", as: :delete_carousel_image

  resources :products
  resources :categories
  get 'perfil', to: 'profiles#show', as: :user_profile
  root 'home#index'
  get 'perfil/editar', to: 'profiles#edit', as: :edit_user_profile
  patch 'perfil', to: 'profiles#update'
  resource :profile, only: [:show, :edit, :update], controller: 'profiles'
  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
