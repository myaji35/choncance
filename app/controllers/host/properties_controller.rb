class Host::PropertiesController < Host::BaseController
  before_action :set_property, only: [:edit, :update, :destroy, :approve, :reject]

  def index
    @properties = Property.order(created_at: :desc)
  end

  def new
    @property = Property.new
    @tags = Tag.all.order(:name)
  end

  def create
    @property = Property.new(property_params)
    @property.status = :draft
    if @property.save
      @property.tag_ids = params[:property][:tag_ids] if params[:property][:tag_ids]
      redirect_to host_dashboard_path, notice: "숙소가 등록되었습니다."
    else
      @tags = Tag.all.order(:name)
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @tags = Tag.all.order(:name)
  end

  def update
    if @property.update(property_params)
      @property.tag_ids = params[:property][:tag_ids] || []
      redirect_to host_dashboard_path, notice: "숙소 정보가 수정되었습니다."
    else
      @tags = Tag.all.order(:name)
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @property.destroy
    redirect_to host_dashboard_path, notice: "숙소가 삭제되었습니다."
  end

  def approve
    @property.update!(status: :active)
    redirect_to host_properties_path, notice: "숙소가 승인되었습니다."
  rescue => e
    redirect_to host_properties_path, alert: "승인 처리 중 오류가 발생했습니다: #{e.message}"
  end

  def reject
    @property.destroy
    redirect_to host_properties_path, notice: "숙소가 거부 및 삭제되었습니다."
  end

  private

  def set_property
    @property = Property.find(params[:id])
  end

  def property_params
    params.require(:property).permit(:title, :description, :location, :price_per_night, :status)
  end
end
