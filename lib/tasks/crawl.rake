namespace :crawl do
  desc "한국관광공사 TourAPI로 농촌 숙소 데이터를 수집합니다"
  task properties: :environment do
    log_file = Rails.root.join("log", "crawl.log")
    logger   = Logger.new(log_file)
    logger.level = Logger::INFO
    logger.formatter = proc { |severity, time, _progname, msg|
      "[#{time.strftime('%Y-%m-%d %H:%M:%S')}] [#{severity}] #{msg}\n"
    }

    Rails.logger = logger
    ActiveRecord::Base.logger = nil  # DB 쿼리 로그 숨김

    puts "[crawl:properties] 시작 (#{Time.current.strftime('%Y-%m-%d %H:%M:%S')})"
    puts "  로그: #{log_file}"

    begin
      crawler  = Crawlers::TourApiCrawler.new
      items    = crawler.call

      puts "  수집된 항목: #{items.size}건"

      importer = PropertyImporter.new(items).import!
      summary  = importer.summary

      puts "  신규 저장:  #{summary[:imported]}건"
      puts "  중복 건너뜀: #{summary[:skipped]}건"
      puts "  실패:       #{summary[:failed]}건"
      puts "[crawl:properties] 완료"
    rescue => e
      puts "[crawl:properties] 오류: #{e.message}"
      Rails.logger.error("[crawl:properties] 오류: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
      exit 1
    end
  end

  desc "수집된 숙소 통계를 출력합니다"
  task stats: :environment do
    total     = Property.count
    auto      = Property.auto_collected.count
    manual    = Property.manual.count
    pending   = Property.pending_review.count
    active    = Property.active.count

    puts "=== 숙소 통계 ==="
    puts "전체:         #{total}건"
    puts "자동 수집:    #{auto}건"
    puts "수동 등록:    #{manual}건"
    puts "승인 대기:    #{pending}건"
    puts "승인 완료:    #{active}건"
  end
end
