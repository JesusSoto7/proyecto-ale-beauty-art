Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  devise_for :users

  namespace :api do
    namespace :v1, defaults: { format: :json } do
      # Autenticación con Devise Token Auth
      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        sessions: 'api/v1/auth/sessions',
        registrations: 'api/v1/auth/registrations'
      }

      # Carrito
      get 'cart', to: 'cart#show'                    # Ver carrito
      post 'cart/add', to: 'cart#add_product'        # Agregar producto
      delete 'cart/remove', to: 'cart#remove_product' # Quitar producto

      # Categorías y productos
      resources :products, only: [:index, :show]
      resources :categories, only: [:index, :show]
    end
  end


  get 'home', to: 'home#index'
  get "home" => "home#index", as: :welcome
  get 'inicio', to: 'inicio#index'
  get 'productos' => "inicio#all_products", as: :productos
  get 'showClient/:id' => "inicio#showClient", as: :show_product_client
  get 'carousel' => "home#edit_carousel", as: :edit_carousel
  patch 'update_carousel' => "home#update_carousel", as: :update_carousel
  delete 'delete_carousel_image/:id' => "home#delete_carousel_image", as: :delete_carousel_image
  resources :carts, except: [:show] do
    resources :cart_products, only: [:destroy] do
      member do
        patch :increase
        patch :decrease
      end
    end
  end
  get '/cart', to: 'carts#show_current', as: 'current_cart'
  post "/cart/add", to: "carts#add", as: 'add_to_cart'
  get "/cart/count", to: "carts#count", as: 'count_cart'
  post 'cart/add', to: 'cart#add', as: 'cart_add'


  get '/checkout/:id', to: 'checkouts#show', as: :checkout


  resources :checkouts do
    member do
      get :edit_direccion
      get :direccion_envio
      patch :editar_direccion
    end

    collection do
      post :create_address
      get :seleccionar_direccion
    end
  end




  resources :products
  resources :categories
  get 'perfil', to: 'profiles#show', as: :user_profile
  root 'home#index'
  get 'perfil/editar', to: 'profiles#edit', as: :edit_user_profile
  patch 'perfil', to: 'profiles#update'
  resource :profile, only: [:show, :edit, :update], controller: 'profiles'

  get 'about', to: 'pages_about#about', as: :about

  resources :orders, only: [:create]
  resources :payments, only: [:create, :new]
  get '/pago_realizado/:id', to: 'checkouts#success', as: :pago_realizado
  get '/pago_cancelado/:id', to: 'checkouts#rejected', as: :pago_cancelado

  get 'categorias_publicas', to: 'public_categories#index', as: :categorias_publicas
  get 'categorias_publicas/:id', to: 'public_categories#show', as: :categoria_publica

  get '/direcciones', to: 'shipping_addresses#index', as: :direcciones
  resources :shipping_addresses do
    member do
      patch :set_predeterminada
    end
  end





    # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
