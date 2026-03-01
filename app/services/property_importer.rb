class PropertyImporter
  attr_reader :imported_count, :skipped_count, :failed_count

  def initialize(items)
    @items = items
    @imported_count = 0
    @skipped_count  = 0
    @failed_count   = 0
  end

  def import!
    @items.each do |item|
      import_one(item)
    end

    Rails.logger.info(
      "[PropertyImporter] 완료 — 신규: #{@imported_count}, 건너뜀: #{@skipped_count}, 실패: #{@failed_count}"
    )

    self
  end

  def summary
    { imported: @imported_count, skipped: @skipped_count, failed: @failed_count }
  end

  private

  def import_one(item)
    external_id = item[:external_id]
    return unless external_id.present?

    # 중복 확인
    if Property.exists?(external_id: external_id)
      @skipped_count += 1
      return
    end

    property = Property.new(item)
    # auto_collected? → price_per_night 검증 제외 (nil 허용)
    if property.save(validate: false)
      @imported_count += 1
    else
      Rails.logger.error("[PropertyImporter] 저장 실패: #{external_id} — #{property.errors.full_messages}")
      @failed_count += 1
    end
  rescue => e
    Rails.logger.error("[PropertyImporter] 예외: #{external_id} — #{e.message}")
    @failed_count += 1
  end
end
