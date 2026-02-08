class DashboardController < ApplicationController
  # Ensure the user is authenticated (using helper from Rails 8 generate authentication)
  # Based on standard output, the helper might be 'require_authentication' or similar.
  # Looking at application_controller.rb, it includes Authentication.
  
  before_action :require_authentication

  def index
    @user = Current.user
    @recent_bookings = [] # Mock for now
  end
end
