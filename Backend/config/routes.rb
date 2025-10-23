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

      resources :categories, param: :slug do
        resources :sub_categories, param: :slug do
          get :products_by_sub, on: :member
        end
      end

      get 'sub_categories', to: 'sub_categories#all'
      
      # Quitar producto
       get "inicio", to: "inicio#index"
      # Categorías y productos  
      resources :products, param: :slug do
        member do
          get :can_review
        end
        
        collection do
          get :novedades
        end
        
        resources :reviews, only: [:index, :create, :update, :destroy]
      end

      post '/api/ia', to: 'ai#ask'

      resources :notifications, only: [:index, :create, :update] do
        collection do
          get :stats
        end
      end

      resources :discounts

      resources :subcategory_discounts, only: [:index, :show, :create, :destroy]

      resources :categories

      resources :shipping_addresses do
        member do
          patch :set_predeterminada
        end
        collection do
          get :predeterminada
        end
      end

      resources :orders, only: [:create, :index] do
        collection do
          get 'by_payment/:payment_id', to: 'orders#by_payment'
        end
      end
      get "/my_orders", to: "orders#ordenes"
      get "/my_orders/:id", to: "orders#show"

      get 'analytics/product_funnel_per_day', to: 'analytics#product_funnel_per_day'
      get 'analytics/top_3_products', to: 'analytics#top_3_products'

      resources :payments, only: [:create] do
        collection do
          post :create_preference   # POST /api/v1/payments/create_preference
          post :mobile_create 
        end
      end
      resources :users, only: [:index, :update, :destroy]
      get "/me", to: "users#me"
      patch 'me', to: 'users#update' 
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

      resources :reviews, only: [:index, :create]
    end
  end


    # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
