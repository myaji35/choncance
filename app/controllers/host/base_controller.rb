class Host::BaseController < ApplicationController
  before_action :require_authentication
end
