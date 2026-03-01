require "net/http"
require "json"
require "uri"

module Crawlers
  class TourApiCrawler < BaseCrawler
    BASE_URL = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1"
    CONTENT_TYPE_LODGING = "32"
    NUM_OF_ROWS = 100

    # 농촌 관련 지역 areaCode
    AREA_CODES = {
      "강원" => "32",
      "충북" => "33",
      "충남" => "34",
      "경북" => "35",
      "경남" => "36",
      "전북" => "37",
      "전남" => "38",
      "제주" => "39"
    }.freeze

    def initialize(api_key: nil, max_per_area: 100)
      @api_key = api_key || ENV["TOUR_API_KEY"]
      @max_per_area = max_per_area
    end

    def call
      raise "TOUR_API_KEY is not set" if @api_key.blank?

      results = []

      AREA_CODES.each do |area_name, area_code|
        log("수집 시작: #{area_name} (areaCode=#{area_code})")
        items = fetch_area(area_code)
        log("#{area_name}: #{items.size}건 수집")
        results.concat(items)
        sleep_rate_limit
      end

      results
    end

    private

    def fetch_area(area_code, page: 1)
      items = []
      page_no = page

      loop do
        url = build_url(area_code, page_no)
        data = fetch_json(url)

        break unless data

        body = data.dig("response", "body")
        break unless body

        total_count = body["totalCount"].to_i
        current_items = Array(body.dig("items", "item"))
        items.concat(current_items.map { |item| parse_item(item) }.compact)

        log("  page #{page_no}: #{current_items.size}건 (누적 #{items.size}/#{total_count})")

        break if items.size >= @max_per_area
        break if items.size >= total_count
        break if current_items.size < NUM_OF_ROWS

        page_no += 1
        sleep_rate_limit
      end

      items
    end

    def build_url(area_code, page_no)
      params = {
        serviceKey: @api_key,
        numOfRows: NUM_OF_ROWS,
        pageNo: page_no,
        MobileOS: "ETC",
        MobileApp: "VINTEE",
        _type: "json",
        listYN: "Y",
        arrange: "A",
        contentTypeId: CONTENT_TYPE_LODGING,
        areaCode: area_code
      }

      "#{BASE_URL}?#{URI.encode_www_form(params)}"
    end

    def parse_item(item)
      title = item["title"].to_s.strip
      addr  = [ item["addr1"], item["addr2"] ].reject(&:blank?).join(" ").strip

      return nil if title.blank? || addr.blank?

      {
        external_id:   "tourapi_#{item['contentid']}",
        title:         title,
        description:   nil,
        location:      addr,
        thumbnail_url: item["firstimage"].presence,
        latitude:      item["mapy"].presence&.to_d,
        longitude:     item["mapx"].presence&.to_d,
        phone:         item["tel"].presence,
        source:        "uploaded",
        uploaded_by:   "System Auto-Collection",
        status:        "draft"
      }
    end
  end
end
