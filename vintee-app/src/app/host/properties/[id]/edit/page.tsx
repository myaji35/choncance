"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const propertyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", location: "", address: "",
    pricePerNight: "", maxGuests: "4", phone: "", status: "active",
  });

  useEffect(() => {
    fetch(`/api/properties/${propertyId}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        const p = data.property;
        setForm({
          title: p.title || "",
          description: p.description || "",
          location: p.location || "",
          address: p.address || "",
          pricePerNight: p.pricePerNight?.toString() || "",
          maxGuests: p.maxGuests?.toString() || "4",
          phone: p.phone || "",
          status: p.status || "active",
        });
        setLoading(false);
      })
      .catch(() => { setError("숙소를 찾을 수 없습니다"); setLoading(false); });
  }, [propertyId]);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/properties/${propertyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pricePerNight: form.pricePerNight ? Number(form.pricePerNight) : undefined,
        maxGuests: Number(form.maxGuests),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "수정에 실패했습니다");
      setSaving(false);
      return;
    }

    toast("숙소가 수정되었습니다");
    router.push("/host");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast(data.error || "삭제에 실패했습니다", "error");
      return;
    }
    toast("숙소가 삭제되었습니다");
    router.push("/host");
    router.refresh();
  };

  if (loading) return <div className="mx-auto max-w-lg px-4 py-8 text-center text-gray-400">불러오는 중...</div>;
  if (error && !form.title) return <div className="mx-auto max-w-lg px-4 py-8 text-center text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-xl font-bold text-[#16325C]">숙소 수정</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">숙소명 *</label>
          <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">소개</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">지역 *</label>
            <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">상세 주소</label>
            <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">1박 가격</label>
            <input type="number" value={form.pricePerNight} onChange={(e) => update("pricePerNight", e.target.value)} min={0} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">최대 인원</label>
            <input type="number" value={form.maxGuests} onChange={(e) => update("maxGuests", e.target.value)} min={1} max={20} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">연락처</label>
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">공개 상태</label>
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#00A1E0] focus:outline-none focus:ring-1 focus:ring-[#00A1E0]">
            <option value="active">공개</option>
            <option value="draft">임시 저장</option>
            <option value="inactive">비활성</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">취소</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-[#00A1E0] py-2.5 text-sm font-bold text-white hover:bg-[#0090C7] disabled:opacity-50">
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <button onClick={handleDelete} className="text-sm text-red-500 hover:underline">
          숙소 삭제
        </button>
      </div>
    </div>
  );
}
