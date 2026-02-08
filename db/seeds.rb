# Seed Tags/Themes
tags = [
  { name: "#논뷰맛집", icon: "🌾", category: 0 },
  { name: "#불멍과별멍", icon: "🔥", category: 0 },
  { name: "#반려동물동반", icon: "🐾", category: 0 },
  { name: "#아궁이체험", icon: "🪵", category: 0 },
  { name: "#전통한옥", icon: "🏯", category: 0 },
  { name: "#농사체험", icon: "👨‍🌾", category: 0 }
].map { |t| Tag.find_or_create_by!(t) }

# Seed Properties
properties_data = [
  {
    title: "강릉 초당 논뷰 한옥 '담소'",
    description: "창밖으로 끝없이 펼쳐진 초록빛 논을 보며 진정한 쉼을 만끽하세요. 호스트가 직접 가꾼 아궁이 온돌방이 매력적인 곳입니다.",
    location: "강원도 강릉시",
    price_per_night: 150000,
    status: 1
  },
  {
    title: "안동 별 헤는 밤, '은하수 스테이'",
    description: "도시의 불빛이 닿지 않는 안동 깊숙한 곳. 밤에는 마당에서 쏟아지는 별을 보며 불멍을 즐길 수 있습니다.",
    location: "경상북도 안동시",
    price_per_night: 180000,
    status: 1
  },
  {
    title: "제주 구좌읍 '댕댕이 촌캉스'",
    description: "반려동물과 함께 눈치 보지 않고 뛰어놀 수 있는 넓은 앞마당과 돌담집. 제주 시골 마을의 정취를 느껴보세요.",
    location: "제주특별자치도 구좌읍",
    price_per_night: 220000,
    status: 1
  }
]

properties_data.each_with_index do |data, index|
  p = Property.find_or_create_by!(title: data[:title]) do |prop|
    prop.description = data[:description]
    prop.location = data[:location]
    prop.price_per_night = data[:price_per_night]
    prop.status = data[:status]
  end
  
  # Assign tags
  case index
  when 0 then p.tags << [tags[0], tags[3], tags[4]]
  when 1 then p.tags << [tags[1], tags[4]]
  when 2 then p.tags << [tags[2]]
  end
end

puts "✅ Seeded #{Tag.count} Tags and #{Property.count} Properties."
