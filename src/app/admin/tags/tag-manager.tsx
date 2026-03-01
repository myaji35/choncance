"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Edit, Plus, Trash2 } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  category: string;
  color: string | null;
  _count: { properties: number };
}

interface TagManagerProps {
  initialTags: Tag[];
}

const CATEGORY_LABELS: Record<string, string> = {
  VIEW: "뷰",
  ACTIVITY: "액티비티",
  FACILITY: "시설",
  VIBE: "분위기",
};

const CATEGORY_COLORS: Record<string, string> = {
  VIEW: "bg-blue-100 text-blue-800",
  ACTIVITY: "bg-green-100 text-green-800",
  FACILITY: "bg-purple-100 text-purple-800",
  VIBE: "bg-orange-100 text-orange-800",
};

const emptyForm = {
  name: "",
  icon: "",
  description: "",
  category: "VIEW" as const,
  color: "",
};

export function TagManager({ initialTags }: TagManagerProps) {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditingTag(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setForm({
      name: tag.name,
      icon: tag.icon || "",
      description: tag.description || "",
      category: tag.category as typeof emptyForm.category,
      color: tag.color || "",
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.startsWith("#")) {
      setFormError("태그명은 #으로 시작해야 합니다");
      return;
    }
    if (form.name.length < 2) {
      setFormError("태그명은 최소 2자 이상이어야 합니다");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const url = editingTag
        ? `/api/admin/tags/${editingTag.id}`
        : "/api/admin/tags";
      const method = editingTag ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "처리 중 오류가 발생했습니다");
        return;
      }

      setShowForm(false);
      router.refresh();
      // Optimistic update
      if (editingTag) {
        setTags((prev) =>
          prev.map((t) =>
            t.id === editingTag.id
              ? { ...t, ...form, _count: t._count }
              : t
          )
        );
      } else {
        // Re-fetch after create
        const listRes = await fetch("/api/admin/tags");
        const listData = await listRes.json();
        if (listData.tags) setTags(listData.tags);
      }
    } catch {
      setFormError("네트워크 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/tags/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "삭제 중 오류가 발생했습니다");
        return;
      }

      setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError("네트워크 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">총 {tags.length}개 태그</p>
        <Button onClick={openCreate} className="bg-[#00A1E0] hover:bg-[#0090C8]">
          <Plus className="w-4 h-4 mr-2" />
          새 태그 추가
        </Button>
      </div>

      {/* Tag List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="border rounded-lg p-4 bg-white flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {tag.icon && <span className="text-2xl">{tag.icon}</span>}
                <div>
                  <p className="font-semibold text-[#16325C]">{tag.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      CATEGORY_COLORS[tag.category] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {CATEGORY_LABELS[tag.category] || tag.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(tag)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="수정"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteTarget(tag);
                  }}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  aria-label="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {tag.description && (
              <p className="text-xs text-gray-500 line-clamp-2">{tag.description}</p>
            )}

            <div className="flex items-center gap-1 text-xs text-gray-500 border-t pt-2">
              <span>사용 중인 숙소:</span>
              <Badge variant={tag._count.properties > 0 ? "default" : "secondary"} className="text-xs">
                {tag._count.properties}개
              </Badge>
            </div>
          </div>
        ))}

        {tags.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            등록된 태그가 없습니다. 새 태그를 추가해보세요.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showForm} onOpenChange={(v) => { if (!v) setShowForm(false); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingTag ? "태그 수정" : "새 태그 추가"}</DialogTitle>
            <DialogDescription>
              태그 정보를 입력해주세요. 태그명은 #으로 시작해야 합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tag-name">
                태그명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tag-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="#논뷰맛집"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-icon">아이콘 (이모지)</Label>
              <Input
                id="tag-icon"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🌾"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-category">
                카테고리 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as typeof emptyForm.category }))
                }
              >
                <SelectTrigger id="tag-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEW">뷰 (VIEW)</SelectItem>
                  <SelectItem value="ACTIVITY">액티비티 (ACTIVITY)</SelectItem>
                  <SelectItem value="FACILITY">시설 (FACILITY)</SelectItem>
                  <SelectItem value="VIBE">분위기 (VIBE)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-description">설명</Label>
              <Textarea
                id="tag-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="태그 설명을 입력해주세요 (최대 100자)"
                maxLength={100}
                rows={2}
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#00A1E0] hover:bg-[#0090C8]"
            >
              {submitting ? "처리 중..." : editingTag ? "수정 완료" : "태그 추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>태그 삭제</DialogTitle>
            <DialogDescription>
              정말로 <strong>{deleteTarget?.name}</strong> 태그를 삭제하시겠습니까?
              {deleteTarget && deleteTarget._count.properties > 0 && (
                <span className="text-red-600 block mt-2">
                  이 태그는 {deleteTarget._count.properties}개 숙소에서 사용 중입니다.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {deleteError}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
