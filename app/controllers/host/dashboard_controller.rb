class Host::DashboardController < Host::BaseController
  def index
    @properties = Property.order(created_at: :desc)
    @total_properties = @properties.count
    @active_properties = @properties.active.count
    @draft_properties = @properties.draft.count
    @pending_review = Property.pending_review.order(created_at: :desc)
  end
end
