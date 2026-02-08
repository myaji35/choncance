Rails.application.routes.draw do
  root "home#index"
  
  resources :properties, only: [:index, :show]
  get "dashboard" => "dashboard#index", as: :dashboard
  
  resource :session
  resources :passwords, param: :token

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
