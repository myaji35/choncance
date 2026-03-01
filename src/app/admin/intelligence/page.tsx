"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Star,
  Phone,
  MapPin,
  TrendingUp,
  Users,
  Clock,
  RefreshCw,
} from "lucide-react";

interface IntelligenceItem {
  id: string;
  name: string;
  region: string | null;
  subregion: string | null;
  vinteeScore: number | null;
  totalReviews: number | null;
  autoTags: string[];
  isRecruited: boolean;
  phone: string | null;
  thumbnailUrl: string | null;
  updatedAt: string;
}

interface Stats {
  totalCount: number;
  highScoreCount: number;
  recruitedCount: number;
  lastCrawledAt: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const REGIONS = [
  "전체",
  "강원도",
  "경기도",
  "충청남도",
  "충청북도",
  "전라남도",
  "전라북도",
  "경상남도",
  "경상북도",
  "제주도",
];

export default function IntelligencePage() {
  const [data, setData] = useState<IntelligenceItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [minScore, setMinScore] = useState("");
  const [isRecruited, setIsRecruited] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (region) params.set("region", region);
    if (minScore) params.set("min_score", minScore);
    if (isRecruited) params.set("is_recruited", isRecruited);
    params.set("page", String(page));
    params.set("limit", "20");

    try {
      const res = await fetch(`/api/admin/intelligence?${params}`);
      const json = await res.json();
      setData(json.data ?? []);
      setStats(json.stats ?? null);
      setPagination(json.pagination ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, region, minScore, isRecruited, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecruit = async (id: string, recruited: boolean) => {
    await fetch(`/api/admin/intelligence/${id}/recruit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRecruited: recruited }),
    });
    fetchData();
  };

  const scoreColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 4.5) return "text-emerald-600 font-bold";
    if (score >= 4.0) return "text-blue-600 font-semibold";
    if (score >= 3.5) return "text-amber-600";
    return "text-gray-500";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#16325C]">
            인텔리전스 DB
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            크롤링으로 수집된 전국 펜션 데이터
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/crawl-monitor">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              크롤 모니터
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              대시보드
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI 카드 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">수집 숙소</p>
                  <p className="text-xl font-bold text-[#16325C]">
                    {stats.totalCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Star className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">고점수 (4.0+)</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {stats.highScoreCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">영입 완료</p>
                  <p className="text-xl font-bold text-purple-600">
                    {stats.recruitedCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">마지막 크롤링</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {stats.lastCrawledAt
                      ? new Date(stats.lastCrawledAt).toLocaleDateString("ko-KR")
                      : "없음"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 필터 */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="숙소명 검색..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={region}
              onChange={(e) => { setRegion(e.target.value === "전체" ? "" : e.target.value); setPage(1); }}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r === "전체" ? "" : r}>{r}</option>
              ))}
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={minScore}
              onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
            >
              <option value="">전체 점수</option>
              <option value="4.5">4.5+</option>
              <option value="4.0">4.0+</option>
              <option value="3.5">3.5+</option>
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={isRecruited}
              onChange={(e) => { setIsRecruited(e.target.value); setPage(1); }}
            >
              <option value="">전체</option>
              <option value="false">미영입</option>
              <option value="true">영입 완료</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 테이블 */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gray-500">
            총 {pagination?.total.toLocaleString() ?? 0}건
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <p className="text-center py-16 text-gray-400">데이터가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">숙소명</th>
                    <th className="px-4 py-3 text-left">지역</th>
                    <th className="px-4 py-3 text-center">빈티 점수</th>
                    <th className="px-4 py-3 text-center">리뷰수</th>
                    <th className="px-4 py-3 text-left">태그</th>
                    <th className="px-4 py-3 text-center">상태</th>
                    <th className="px-4 py-3 text-center">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#16325C]">{item.name}</div>
                        {item.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {item.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.region}
                        {item.subregion && (
                          <span className="text-gray-400 text-xs ml-1">
                            {item.subregion}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className={`flex items-center justify-center gap-1 ${scoreColor(item.vinteeScore)}`}>
                          <TrendingUp className="w-3.5 h-3.5" />
                          {item.vinteeScore != null
                            ? Number(item.vinteeScore).toFixed(2)
                            : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.totalReviews ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(item.autoTags ?? []).slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs py-0 px-1.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {(item.autoTags ?? []).length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{item.autoTags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.isRecruited ? (
                          <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                            영입완료
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            미영입
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant={item.isRecruited ? "outline" : "default"}
                          className="text-xs h-7 px-2"
                          onClick={() => handleRecruit(item.id, !item.isRecruited)}
                        >
                          {item.isRecruited ? "영입취소" : "영입하기"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </Button>
          <span className="flex items-center text-sm text-gray-600 px-3">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
