class HomeController < ApplicationController
  allow_unauthenticated_access

  def index
    @featured_properties = Property.active.limit(3)
    @tags = Tag.limit(4)
  end
end
