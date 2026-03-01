"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Database,
  MapPin,
  TrendingUp,
} from "lucide-react";

interface JobLog {
  id: string;
  source: string;
  region: string | null;
  status: string;
  totalCrawled: number | null;
  newProperties: number | null;
  updatedProperties: number | null;
  errorCount: number | null;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
}

interface Summary {
  totalIntelligence: number;
  highScoreCount: number;
  recruitedCount: number;
  lastCrawledAt: string | null;
  lastBatchTotal: number;
  lastBatchNew: number;
  runningJobsCount: number;
}

interface RegionDist {
  region: string | null;
  count: number;
}

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <span className="flex items-center gap-1 text-emerald-600 text-xs">
          <CheckCircle className="w-3.5 h-3.5" /> 완료
        </span>
      );
    case "running":
      return (
        <span className="flex items-center gap-1 text-blue-600 text-xs">
          <Play className="w-3.5 h-3.5 animate-pulse" /> 진행 중
        </span>
      );
    case "failed":
      return (
        <span className="flex items-center gap-1 text-red-600 text-xs">
          <XCircle className="w-3.5 h-3.5" /> 실패
        </span>
      );
    case "partial":
      return (
        <span className="flex items-center gap-1 text-amber-600 text-xs">
          <Clock className="w-3.5 h-3.5" /> 부분완료
        </span>
      );
    default:
      return <span className="text-gray-400 text-xs">{status}</span>;
  }
}

function sourceLabel(source: string) {
  const map: Record<string, string> = {
    naver: "네이버",
    kakao: "카카오",
    yanolja: "야놀자",
    yeogi: "여기어때",
    airbnb: "에어비앤비",
    blog: "블로그",
  };
  return map[source] ?? source;
}

export default function CrawlMonitorPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobLog[]>([]);
  const [runningJobs, setRunningJobs] = useState<JobLog[]>([]);
  const [regionDist, setRegionDist] = useState<RegionDist[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crawl-monitor");
      const json = await res.json();
      setSummary(json.summary ?? null);
      setRecentJobs(json.recentJobs ?? []);
      setRunningJobs(json.runningJobs ?? []);
      setRegionDist(json.regionDistribution ?? []);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // 진행 중 작업이 있으면 30초마다 자동 갱신
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#16325C]">크롤 모니터</h1>
          <p className="text-gray-500 text-sm mt-1">
            데이터 수집 현황 및 작업 이력
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            마지막 갱신: {lastRefreshed.toLocaleTimeString("ko-KR")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
          <Link href="/admin/intelligence">
            <Button variant="outline" size="sm">
              인텔리전스 DB
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI 카드 */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">총 수집 숙소</p>
                  <p className="text-xl font-bold text-[#16325C]">
                    {summary.totalIntelligence.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">최근 배치 수집</p>
                  <p className="text-xl font-bold text-emerald-600">
                    +{summary.lastBatchNew.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    전체 {summary.lastBatchTotal}건 중
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${summary.runningJobsCount > 0 ? "bg-blue-100" : "bg-gray-100"}`}>
                  <Play className={`w-5 h-5 ${summary.runningJobsCount > 0 ? "text-blue-600 animate-pulse" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">진행 중 작업</p>
                  <p className={`text-xl font-bold ${summary.runningJobsCount > 0 ? "text-blue-600" : "text-gray-400"}`}>
                    {summary.runningJobsCount}개
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
                    {summary.lastCrawledAt
                      ? new Date(summary.lastCrawledAt).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "없음"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* 지역별 분포 */}
        <Card>
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00A1E0]" />
              지역별 수집 현황
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {regionDist.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">데이터 없음</p>
            ) : (
              <div className="space-y-2">
                {regionDist.map((r) => (
                  <div key={r.region ?? "unknown"} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{r.region ?? "미분류"}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-blue-200 rounded-full"
                        style={{
                          width: `${Math.max(
                            8,
                            ((r.count / (regionDist[0]?.count || 1)) * 60)
                          )}px`,
                        }}
                      />
                      <span className="text-xs font-semibold text-[#16325C] w-10 text-right">
                        {r.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 작업 이력 */}
        <Card className="md:col-span-2">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00A1E0]" />
              최근 작업 이력
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentJobs.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                크롤링 작업 이력이 없습니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs">
                    <tr>
                      <th className="px-4 py-2 text-left">소스</th>
                      <th className="px-4 py-2 text-left">지역</th>
                      <th className="px-4 py-2 text-center">상태</th>
                      <th className="px-4 py-2 text-center">수집</th>
                      <th className="px-4 py-2 text-center">신규</th>
                      <th className="px-4 py-2 text-center">오류</th>
                      <th className="px-4 py-2 text-right">소요시간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <Badge variant="outline" className="text-xs">
                            {sourceLabel(job.source)}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-gray-600 text-xs">
                          {job.region ?? "전국"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {statusBadge(job.status)}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-700">
                          {job.totalCrawled ?? "-"}
                        </td>
                        <td className="px-4 py-2 text-center text-emerald-600 font-medium">
                          {job.newProperties != null ? `+${job.newProperties}` : "-"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {job.errorCount ? (
                            <span className="text-red-500">{job.errorCount}</span>
                          ) : (
                            <span className="text-gray-300">0</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-500 text-xs">
                          {job.durationSeconds != null
                            ? `${job.durationSeconds}s`
                            : job.completedAt
                            ? "-"
                            : "진행 중"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 진행 중 작업 */}
      {runningJobs.length > 0 && (
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader className="py-3 px-4 border-b border-blue-200">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <Play className="w-4 h-4 animate-pulse" />
              현재 진행 중인 작업 ({runningJobs.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              {runningJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="font-medium">{sourceLabel(job.source)}</span>
                  {job.region && (
                    <span className="text-gray-500">— {job.region}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(job.startedAt).toLocaleTimeString("ko-KR")} 시작
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
