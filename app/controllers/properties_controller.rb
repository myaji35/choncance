class PropertiesController < ApplicationController
  allow_unauthenticated_access only: [:index, :show]

  def index
    @tags = Tag.all
    @properties = Property.active
    
    if params[:tag].present?
      @tag = Tag.find_by(name: params[:tag])
      @properties = @tag.properties.active if @tag
    end
  end

  def show
    @property = Property.find(params[:id])
  end
end
