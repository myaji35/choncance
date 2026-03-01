import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Tag } from "lucide-react";
import { TagManager } from "./tag-manager";

export default async function AdminTagsPage() {
  await requireAdminAuth();

  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { properties: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalProperties = tags.reduce((sum, t) => sum + t._count.properties, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            대시보드
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#16325C]">태그 관리</h1>
          <p className="text-gray-600 mt-1">
            테마 태그를 생성, 수정, 삭제할 수 있습니다
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">전체 태그</p>
                <p className="text-2xl font-bold">{tags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">태그 사용 숙소</p>
            <p className="text-2xl font-bold text-[#00A1E0]">{totalProperties}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">미사용 태그</p>
            <p className="text-2xl font-bold text-amber-600">
              {tags.filter((t) => t._count.properties === 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tag Manager (Client Component) */}
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-lg text-[#16325C]">태그 목록</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <TagManager initialTags={tags} />
        </CardContent>
      </Card>
    </div>
  );
}
