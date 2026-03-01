Rails.application.routes.draw do
  root "home#index"
  
  resources :properties, only: [:index, :show] do
    resources :reviews, only: [:index, :new, :create]
  end
  resources :bookings, only: [:index, :show] do
    member do
      patch :cancel
    end
  end
  get "dashboard" => "dashboard#index", as: :dashboard

  namespace :host do
    get "dashboard", to: "dashboard#index", as: :dashboard
    resources :properties, only: [:index, :new, :create, :edit, :update, :destroy] do
      member do
        patch :approve
        delete :reject
      end
    end
    resources :reviews, only: [] do
      member do
        patch :reply
      end
    end
  end
  
  resource :session
  resources :passwords, param: :token

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
