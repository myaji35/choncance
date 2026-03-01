class ReviewsController < ApplicationController
  before_action :set_property

  def index
    @reviews = @property.reviews.recent
  end

  def new
    @review = Review.new
  end

  def create
    @review = @property.reviews.build(review_params)
    @review.user = Current.user

    if @review.save
      redirect_to property_path(@property), notice: "리뷰가 등록되었습니다."
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def set_property
    @property = Property.find(params[:property_id])
  end

  def review_params
    params.require(:review).permit(:rating, :comment)
  end
end
