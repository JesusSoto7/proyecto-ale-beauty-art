Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  devise_for :users

  namespace :api do
    namespace :v1, defaults: { format: :json } do
      namespace :auth do
        post 'sign_in', to: 'sessions#create'
        post 'sign_up', to: 'registrations#create'
        delete 'sign_out', to: 'sessions#logout'
      end
      # Carrito
      get "cart", to: "cart#show"
      post 'cart/add_product', to: 'cart#add_product'        
      delete 'cart/remove_product', to: 'cart#remove_product'

      get    'carousel', to: 'carousel#index'
      patch  'carousel', to: 'carousel#update'
      delete 'carousel/:id', to: 'carousel#destroy'

      resources :favorites, only: [:create, :destroy, :index]

 # Quitar producto
       get "inicio", to: "inicio#index"
      # Categorías y productos  
      resources :products, param: :slug

      resources :categories

      resources :shipping_addresses do
        member do
          patch :set_predeterminada
        end
        collection do
          get :predeterminada
        end
      end

      resources :orders, only: [:create]
      resources :payments, only: [:create]

      get "/me", to: "users#me"
      get "/count", to: "users#count"
      get "/registrations_per_day", to: "users#registrations_per_day"

      get "completed_orders_count", to: "orders#count_completed"
      get "orders_completed_per_day", to: "orders#orders_completed_per_day"
      get "total_sales", to: "orders#total_sales"
      get "total_sales_per_day", to: "orders#total_sales_per_day"
      get "total_sales_by_category", to: "orders#total_sales_by_category"

      get 'locations/departments', to: 'locations#departments'
      get 'locations/municipalities/:department_id', to: 'locations#municipalities'
      get 'locations/neighborhoods/:municipality_id', to: 'locations#neighborhoods'


    end
  end


  get 'home', to: 'home#index'
  get "home" => "home#index", as: :welcome
  get 'inicio', to: 'inicio#index'
  get 'productos' => "inicio#all_products", as: :productos
  get 'showProduct/:id' => "inicio#showProduct", as: :show_product_client
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
  post "/cart/add", to: "carts#add", as: 'add_to_cart', defaults: { format: :json }
  get "/cart/count", to: "carts#count", as: 'count_cart'

  get '/checkout/:id', to: 'checkouts#show', as: :checkout


  resources :checkouts do
    collection do
      get 'create_address/:id', to: 'checkouts#new_address', as: 'create_address'
      get 'new_address', to: 'checkouts#new_address', as: 'new_address'
      post 'create_address', to: 'checkouts#create_address', as: 'create_address_post'
      patch 'editar_direccion/:id', to: 'checkouts#editar_direccion', as: 'editar_direccion'
      get :seleccionar_direccion
    end

    member do
      get 'edit_direccion', to: 'checkouts#edit_direccion'
      get :direccion_envio
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

  get 'categorias', to: 'user_categories#index', as: :user_categories
  get 'categorias/:id', to: 'user_categories#show', as: :user_category

  get '/direcciones', to: 'shipping_addresses#index', as: :direcciones
  resources :shipping_addresses do
    member do
      patch :set_predeterminada
    end
  end

  resources :favorites, only: [:create]
  delete 'favorites', to: 'favorites#destroy'
  get 'favorites/modal_favorites', to: 'favorites#modal_favorites'

  get '/locations/municipalities', to: 'locations#municipalities'
  get '/locations/neighborhoods', to: 'locations#neighborhoods'




    # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
