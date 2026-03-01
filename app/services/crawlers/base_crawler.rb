module Crawlers
  class BaseCrawler
    RATE_LIMIT_SECONDS = 1

    def call
      raise NotImplementedError, "#{self.class}#call must be implemented"
    end

    private

    def fetch_json(url)
      uri = URI(url)
      response = Net::HTTP.get_response(uri)

      unless response.is_a?(Net::HTTPSuccess)
        Rails.logger.error("[Crawler] HTTP #{response.code} for #{url}")
        return nil
      end

      JSON.parse(response.body)
    rescue => e
      Rails.logger.error("[Crawler] fetch_json error: #{e.message} (url=#{url})")
      nil
    end

    def sleep_rate_limit
      sleep(RATE_LIMIT_SECONDS)
    end

    def log(msg)
      Rails.logger.info("[Crawler] #{msg}")
    end

    def log_error(msg)
      Rails.logger.error("[Crawler] #{msg}")
    end
  end
end
