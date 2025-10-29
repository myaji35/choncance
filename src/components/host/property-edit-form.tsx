"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tag, TagCategory } from "@/types";

interface PropertyEditFormProps {
  property: any; // Property from Prisma
  tags: Record<TagCategory, Tag[]>;
}

export function PropertyEditForm({ property, tags }: PropertyEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data with existing property data
  const [formData, setFormData] = useState({
    name: property.name || "",
    description: property.description || "",
    address: property.address || "",
    province: property.province || "",
    city: property.city || "",
    pricePerNight: property.pricePerNight?.toString() || "",
    maxGuests: property.maxGuests?.toString() || "2",
    allowsPets: property.allowsPets || false,
    amenities: property.amenities || [],
    checkInTime: property.checkInTime || "15:00",
    checkOutTime: property.checkOutTime || "11:00",
    minNights: property.minNights?.toString() || "1",
    maxNights: property.maxNights?.toString() || "30",
    hostStory: property.hostStory || "",
    rules: property.rules || "",
    images: property.images?.join(", ") || "",
    thumbnailUrl: property.thumbnailUrl || "",
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
          maxGuests: parseInt(formData.maxGuests),
          minNights: parseInt(formData.minNights),
          maxNights: parseInt(formData.maxNights),
          images: formData.images ? formData.images.split(",").map((url) => url.trim()) : [],
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
        ? prev.selectedTags.filter((t) => t !== tagName)
        : [...prev.selectedTags, tagName],
    }));
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
                        amenities: formData.amenities.filter((a) => a !== amenity),
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
          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">대표 이미지 URL</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">추가 이미지 URL (쉼표로 구분)</Label>
            <Textarea
              id="images"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              rows={3}
            />
          </div>
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
