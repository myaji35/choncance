class Host::ReviewsController < Host::BaseController
  before_action :set_review

  def reply
    if @review.host_reply.present?
      redirect_to host_dashboard_path, alert: "이미 답글이 작성되어 있습니다."
      return
    end

    if @review.update(host_reply: params[:host_reply])
      redirect_to host_dashboard_path, notice: "답글이 등록되었습니다."
    else
      redirect_to host_dashboard_path, alert: "답글 등록에 실패했습니다."
    end
  end

  private

  def set_review
    @review = Review.find(params[:id])
  end
end
