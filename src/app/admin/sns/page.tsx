"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, MessageCircle, Hash, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SNSAccount {
  id: string;
  platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "THREADS";
  accountName: string;
  accountUrl: string;
  followerCount: number | null;
  isActive: boolean;
  lastPostAt: Date | null;
  createdAt: Date;
}

export default function AdminSNSPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<SNSAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "THREADS";
    accountName: string;
    accountUrl: string;
    followerCount: string;
    accessToken: string;
    refreshToken: string;
  }>({
    platform: "FACEBOOK",
    accountName: "",
    accountUrl: "",
    followerCount: "",
    accessToken: "",
    refreshToken: "",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/admin/sns");
      const data = await response.json();
      setAccounts(data.accounts);
    } catch (error) {
      console.error("Failed to fetch SNS accounts:", error);
      toast({
        title: "오류",
        description: "SNS 계정 목록을 불러올 수 없습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/sns", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId && { id: editingId }),
          platform: formData.platform,
          accountName: formData.accountName,
          accountUrl: formData.accountUrl,
          followerCount: formData.followerCount
            ? parseInt(formData.followerCount)
            : null,
          accessToken: formData.accessToken || null,
          refreshToken: formData.refreshToken || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "작업에 실패했습니다");
      }

      toast({
        title: editingId ? "계정이 수정되었습니다" : "계정이 추가되었습니다",
      });

      // Reset form
      setFormData({
        platform: "FACEBOOK",
        accountName: "",
        accountUrl: "",
        followerCount: "",
        accessToken: "",
        refreshToken: "",
      });
      setShowAddForm(false);
      setEditingId(null);
      fetchAccounts();
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "오류",
        description:
          error instanceof Error ? error.message : "작업 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 계정을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sns?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("삭제에 실패했습니다");
      }

      toast({ title: "계정이 삭제되었습니다" });
      fetchAccounts();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "오류",
        description: "삭제 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (account: SNSAccount) => {
    setFormData({
      platform: account.platform,
      accountName: account.accountName,
      accountUrl: account.accountUrl,
      followerCount: account.followerCount?.toString() || "",
      accessToken: "",
      refreshToken: "",
    });
    setEditingId(account.id);
    setShowAddForm(true);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "FACEBOOK":
        return <Facebook className="w-5 h-5" />;
      case "INSTAGRAM":
        return <Instagram className="w-5 h-5" />;
      case "TIKTOK":
        return <MessageCircle className="w-5 h-5" />;
      case "THREADS":
        return <Hash className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "FACEBOOK":
        return "bg-blue-500";
      case "INSTAGRAM":
        return "bg-pink-500";
      case "TIKTOK":
        return "bg-black";
      case "THREADS":
        return "bg-gray-700";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">SNS 계정 관리</h1>
          <p className="text-gray-600 mt-2">
            VINTEE의 공식 SNS 채널을 관리합니다
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({
              platform: "FACEBOOK",
              accountName: "",
              accountUrl: "",
              followerCount: "",
              accessToken: "",
              refreshToken: "",
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showAddForm ? "취소" : "계정 추가"}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "계정 수정" : "새 계정 추가"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="platform">플랫폼 *</Label>
              <select
                id="platform"
                value={formData.platform}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    platform: e.target.value as any,
                  })
                }
                className="w-full mt-1 p-2 border rounded"
                disabled={!!editingId}
              >
                <option value="FACEBOOK">Facebook</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="TIKTOK">TikTok</option>
                <option value="THREADS">Threads</option>
              </select>
            </div>

            <div>
              <Label htmlFor="accountName">계정명 *</Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
                placeholder="@vintee_official"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountUrl">계정 URL *</Label>
              <Input
                id="accountUrl"
                type="url"
                value={formData.accountUrl}
                onChange={(e) =>
                  setFormData({ ...formData, accountUrl: e.target.value })
                }
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <Label htmlFor="followerCount">팔로워 수</Label>
              <Input
                id="followerCount"
                type="number"
                value={formData.followerCount}
                onChange={(e) =>
                  setFormData({ ...formData, followerCount: e.target.value })
                }
                placeholder="1000"
              />
            </div>

            <div>
              <Label htmlFor="accessToken">액세스 토큰 (선택)</Label>
              <Input
                id="accessToken"
                type="password"
                value={formData.accessToken}
                onChange={(e) =>
                  setFormData({ ...formData, accessToken: e.target.value })
                }
                placeholder="API 액세스 토큰"
              />
            </div>

            <div>
              <Label htmlFor="refreshToken">리프레시 토큰 (선택)</Label>
              <Input
                id="refreshToken"
                type="password"
                value={formData.refreshToken}
                onChange={(e) =>
                  setFormData({ ...formData, refreshToken: e.target.value })
                }
                placeholder="API 리프레시 토큰"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "수정" : "추가"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Accounts List */}
      <div className="grid md:grid-cols-2 gap-4">
        {accounts.length === 0 ? (
          <Card className="p-8 text-center col-span-2">
            <p className="text-gray-500">등록된 SNS 계정이 없습니다</p>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`${getPlatformColor(
                      account.platform
                    )} text-white p-3 rounded-lg`}
                  >
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {account.accountName}
                    </h3>
                    <p className="text-sm text-gray-500">{account.platform}</p>
                  </div>
                </div>
                <Badge variant={account.isActive ? "default" : "secondary"}>
                  {account.isActive ? "활성" : "비활성"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>
                  <strong>URL:</strong>{" "}
                  <a
                    href={account.accountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {account.accountUrl}
                  </a>
                </p>
                {account.followerCount && (
                  <p>
                    <strong>팔로워:</strong>{" "}
                    {account.followerCount.toLocaleString()}명
                  </p>
                )}
                {account.lastPostAt && (
                  <p>
                    <strong>마지막 게시:</strong>{" "}
                    {new Date(account.lastPostAt).toLocaleDateString("ko-KR")}
                  </p>
                )}
                <p>
                  <strong>등록일:</strong>{" "}
                  {new Date(account.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(account)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(account.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
