module ApplicationHelper
  # 태그 이름을 Line Icon 이름으로 매핑
  def tag_icon_name(tag_name)
    mapping = {
      # VIEW 카테고리
      "논뷰맛집"    => "sun",
      "계곡앞"      => "droplet",
      "바다뷰"      => "wave",
      "산속힐링"    => "mountain",
      # ACTIVITY 카테고리
      "불멍과별멍"  => "moon",
      "아궁이체험"  => "flame",
      "농사체험"    => "leaf",
      "낚시체험"    => "fish",
      # FACILITY 카테고리
      "반려동물동반" => "dog",
      "전통가옥"    => "home",
      "개별바베큐"  => "wind",
      "취사가능"    => "coffee",
      # VIBE 카테고리
      "SNS맛집"     => "camera",
      "커플추천"    => "heart",
      "아이동반"    => "sparkles",
      "혼캉스"      => "moon",
    }
    mapping[tag_name] || "tag"
  end

  # 숙박 상태 배지 색상
  def booking_status_class(status)
    case status
    when "CONFIRMED" then "bg-green-100 text-green-800"
    when "PENDING"   then "bg-amber-100 text-amber-800"
    when "CANCELLED" then "bg-red-100 text-red-800"
    when "COMPLETED" then "bg-slate-100 text-slate-600"
    else "bg-slate-100 text-slate-600"
    end
  end

  # 숙박 상태 한글 표시
  def booking_status_label(status)
    case status
    when "CONFIRMED" then "확정"
    when "PENDING"   then "대기 중"
    when "CANCELLED" then "취소됨"
    when "COMPLETED" then "완료"
    else status
    end
  end
end
