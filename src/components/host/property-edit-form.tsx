"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Star } from "lucide-react";
import Image from "next/image";
import type { Tag, TagCategory } from "@/types";

interface PropertyEditFormProps {
  property: any; // Property from Prisma
  tags: Record<TagCategory, Tag[]>;
}

export function PropertyEditForm({ property, tags }: PropertyEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>(property.images || []);
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(() => {
    if (property.thumbnailUrl && property.images) {
      const index = property.images.indexOf(property.thumbnailUrl);
      return index >= 0 ? index : 0;
    }
    return 0;
  });
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form data with existing property data
  const [formData, setFormData] = useState({
    name: property.name || "",
    description: property.description || "",
    address: property.address || "",
    province: property.province || "",
    city: property.city || "",
    pricePerNight: property.pricePerNight?.toString() || "",
    discountRate: property.discountRate?.toString() || "",
    discountedPrice: property.discountedPrice?.toString() || "",
    maxGuests: property.maxGuests?.toString() || "2",
    allowsPets: property.allowsPets || false,
    amenities: property.amenities || [],
    checkInTime: property.checkInTime || "15:00",
    checkOutTime: property.checkOutTime || "11:00",
    minNights: property.minNights?.toString() || "1",
    maxNights: property.maxNights?.toString() || "30",
    hostStory: property.hostStory || "",
    rules: property.rules || "",
    selectedTags: property.tags?.map((t: any) => t.name) || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.address || !formData.pricePerNight) {
        throw new Error("필수 항목을 모두 입력해주세요");
      }

      // Update property
      const response = await fetch(`/api/host/properties/${property.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          pricePerNight: parseFloat(formData.pricePerNight),
          discountRate: formData.discountRate ? parseInt(formData.discountRate) : null,
          discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
          maxGuests: parseInt(formData.maxGuests),
          minNights: parseInt(formData.minNights),
          maxNights: parseInt(formData.maxNights),
          images: uploadedImages,
          thumbnailUrl: uploadedImages[thumbnailIndex] || uploadedImages[0] || null,
          amenities: formData.amenities,
          tags: formData.selectedTags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "숙소 수정에 실패했습니다");
      }

      // Redirect to dashboard
      router.push("/host/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagName)
        ? prev.selectedTags.filter((t: string) => t !== tagName)
        : [...prev.selectedTags, tagName],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "파일 업로드에 실패했습니다");
      }

      setUploadedImages((prev) => [...prev, ...data.urls]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleImageRemove = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    if (thumbnailIndex >= uploadedImages.length - 1) {
      setThumbnailIndex(Math.max(0, uploadedImages.length - 2));
    }
  };

  const handleSetThumbnail = (index: number) => {
    setThumbnailIndex(index);
  };

  const amenityOptions = [
    "wifi",
    "parking",
    "kitchen",
    "air_conditioning",
    "heating",
    "washer",
    "tv",
    "workspace",
  ];

  const amenityLabels: Record<string, string> = {
    wifi: "와이파이",
    parking: "주차",
    kitchen: "주방",
    air_conditioning: "에어컨",
    heating: "난방",
    washer: "세탁기",
    tv: "TV",
    workspace: "업무 공간",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">숙소 이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 논뷰가 아름다운 한옥"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">숙소 설명 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="숙소에 대한 자세한 설명을 입력해주세요"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostStory">호스트 스토리</Label>
            <Textarea
              id="hostStory"
              value={formData.hostStory}
              onChange={(e) => setFormData({ ...formData, hostStory: e.target.value })}
              placeholder="게스트에게 전하고 싶은 이야기나 공간에 대한 애정을 담아주세요"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>위치 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">주소 *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="예: 강원도 강릉시 주문진읍"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">시/도</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                placeholder="예: 강원도"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">시/군/구</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="예: 강릉시"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing and Capacity */}
      <Card>
        <CardHeader>
          <CardTitle>가격 및 인원</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pricePerNight">1박 가격 (원) *</Label>
            <Input
              id="pricePerNight"
              type="number"
              value={formData.pricePerNight}
              onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
              placeholder="예: 150000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountRate">할인율 (%)</Label>
              <Input
                id="discountRate"
                type="number"
                value={formData.discountRate}
                onChange={(e) => {
                  const rate = e.target.value;
                  setFormData({ ...formData, discountRate: rate });
                  // Auto-calculate discounted price
                  if (rate && formData.pricePerNight) {
                    const discounted = parseFloat(formData.pricePerNight) * (1 - parseInt(rate) / 100);
                    setFormData(prev => ({ ...prev, discountedPrice: discounted.toString() }));
                  }
                }}
                placeholder="예: 20"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500">선택사항: 할인을 적용하려면 입력하세요</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountedPrice">할인가 (원)</Label>
              <Input
                id="discountedPrice"
                type="number"
                value={formData.discountedPrice}
                onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                placeholder="자동 계산됨"
              />
              <p className="text-xs text-gray-500">할인율 입력 시 자동 계산</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxGuests">최대 인원 *</Label>
            <Input
              id="maxGuests"
              type="number"
              value={formData.maxGuests}
              onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
              min="1"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowsPets"
              checked={formData.allowsPets}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, allowsPets: checked === true })
              }
            />
            <Label htmlFor="allowsPets" className="font-normal cursor-pointer">
              반려동물 동반 가능
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Check-in/out */}
      <Card>
        <CardHeader>
          <CardTitle>체크인/체크아웃</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInTime">체크인 시간</Label>
              <Input
                id="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutTime">체크아웃 시간</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minNights">최소 숙박일</Label>
              <Input
                id="minNights"
                type="number"
                value={formData.minNights}
                onChange={(e) => setFormData({ ...formData, minNights: e.target.value })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxNights">최대 숙박일</Label>
              <Input
                id="maxNights"
                type="number"
                value={formData.maxNights}
                onChange={(e) => setFormData({ ...formData, maxNights: e.target.value })}
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>편의시설</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {amenityOptions.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        amenities: [...formData.amenities, amenity],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        amenities: formData.amenities.filter((a: string) => a !== amenity),
                      });
                    }
                  }}
                />
                <Label htmlFor={amenity} className="font-normal cursor-pointer">
                  {amenityLabels[amenity]}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>태그</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(tags).map(([category, categoryTags]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">{category}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoryTags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag.id}
                      checked={formData.selectedTags.includes(tag.name)}
                      onCheckedChange={() => handleTagToggle(tag.name)}
                    />
                    <Label htmlFor={tag.id} className="font-normal cursor-pointer">
                      {tag.name} {tag.icon}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>이미지</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Button */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">숙소 이미지 업로드</Label>
            <div className="flex items-center gap-3">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Label
                htmlFor="image-upload"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? "업로드 중..." : "이미지 선택"}
              </Label>
              <span className="text-sm text-gray-500">
                {uploadedImages.length}개 이미지 업로드됨
              </span>
            </div>
            <p className="text-xs text-gray-500">
              JPG, PNG, WebP 형식 지원. 여러 이미지를 한번에 선택할 수 있습니다.
            </p>
          </div>

          {/* Image Preview Grid */}
          {uploadedImages.length > 0 && (
            <div className="space-y-2">
              <Label>업로드된 이미지</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((url, index) => (
                  <div
                    key={index}
                    className={`relative group rounded-lg overflow-hidden border-2 ${
                      thumbnailIndex === index
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-video bg-gray-100">
                      <Image
                        src={url}
                        alt={`업로드 이미지 ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetThumbnail(index)}
                        className="gap-1"
                      >
                        <Star
                          className={`w-3 h-3 ${
                            thumbnailIndex === index ? "fill-yellow-400 text-yellow-400" : ""
                          }`}
                        />
                        대표
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleImageRemove(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Thumbnail Badge */}
                    {thumbnailIndex === index && (
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        대표 이미지
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle>숙소 규칙</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="rules"
            value={formData.rules}
            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            placeholder="숙소 이용 규칙을 입력해주세요"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "수정 중..." : "수정 완료"}
        </Button>
      </div>
    </form>
  );
}
