"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

export default function ClientReviewPage() {
  // Checklist state
  const [checklist, setChecklist] = useState({
    branding: {
      logo: false,
      meta: false,
      footer: false,
    },
    landing: {
      hero: false,
      search: false,
      howItWorks: false,
      featured: false,
      responsive: false,
    },
    auth: {
      signup: false,
      login: false,
      social: false,
      profile: false,
    },
    explore: {
      list: false,
      tagFilter: false,
      search: false,
      clickDetail: false,
      images: false,
    },
    propertyDetail: {
      info: false,
      gallery: false,
      hostInfo: false,
      tags: false,
      related: false,
    },
    host: {
      becomeHost: false,
      registration: false,
      imageUpload: false,
      myProperties: false,
    },
    admin: {
      qrLogin: false,
      phoneInput: false,
      autoLogin: false,
      approval: false,
    },
  });

  const toggleCheck = (category: string, item: string) => {
    setChecklist(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof checklist],
        [item]: !prev[category as keyof typeof checklist][item as keyof typeof prev[keyof typeof prev]]
      }
    }));
  };

  const getCategoryProgress = (category: string) => {
    const items = Object.values(checklist[category as keyof typeof checklist]);
    const completed = items.filter(Boolean).length;
    return { completed, total: items.length, percentage: Math.round((completed / items.length) * 100) };
  };

  const getTotalProgress = () => {
    let total = 0;
    let completed = 0;
    Object.keys(checklist).forEach(category => {
      const items = Object.values(checklist[category as keyof typeof checklist]);
      total += items.length;
      completed += items.filter(Boolean).length;
    });
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const totalProgress = getTotalProgress();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">VINTEE 프로젝트 검토 체크리스트</h1>
        <p className="text-gray-600">의뢰자를 위한 프로젝트 검토 및 품질 확인 가이드</p>
      </div>

      {/* Overall Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>전체 진행률</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${totalProgress.percentage}%` }}
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {totalProgress.percentage}%
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {totalProgress.completed} / {totalProgress.total} 항목 완료
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2">
          <TabsTrigger value="branding">브랜딩</TabsTrigger>
          <TabsTrigger value="landing">랜딩</TabsTrigger>
          <TabsTrigger value="auth">인증</TabsTrigger>
          <TabsTrigger value="explore">탐색</TabsTrigger>
          <TabsTrigger value="propertyDetail">상세</TabsTrigger>
          <TabsTrigger value="host">호스트</TabsTrigger>
          <TabsTrigger value="admin">관리자</TabsTrigger>
        </TabsList>

        {/* Branding */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>브랜딩</CardTitle>
                  <CardDescription>브랜드 일관성 확인</CardDescription>
                </div>
                <Badge variant={getCategoryProgress('branding').percentage === 100 ? "default" : "secondary"}>
                  {getCategoryProgress('branding').completed} / {getCategoryProgress('branding').total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="branding-logo"
                  checked={checklist.branding.logo}
                  onCheckedChange={() => toggleCheck('branding', 'logo')}
                />
                <label htmlFor="branding-logo" className="text-sm font-medium cursor-pointer">
                  모든 "ChonCance" → "VINTEE"로 변경 확인
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="branding-meta"
                  checked={checklist.branding.meta}
                  onCheckedChange={() => toggleCheck('branding', 'meta')}
                />
                <label htmlFor="branding-meta" className="text-sm font-medium cursor-pointer">
                  로고 이미지 정상 표시 (/vintee-logo.png)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="branding-footer"
                  checked={checklist.branding.footer}
                  onCheckedChange={() => toggleCheck('branding', 'footer')}
                />
                <label htmlFor="branding-footer" className="text-sm font-medium cursor-pointer">
                  메타 태그 및 Footer 브랜드명 확인
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Landing Page */}
        <TabsContent value="landing">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>랜딩 페이지</CardTitle>
                  <CardDescription>메인 페이지 기능 확인</CardDescription>
                </div>
                <Badge variant={getCategoryProgress('landing').percentage === 100 ? "default" : "secondary"}>
                  {getCategoryProgress('landing').completed} / {getCategoryProgress('landing').total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="landing-hero"
                  checked={checklist.landing.hero}
                  onCheckedChange={() => toggleCheck('landing', 'hero')}
                />
                <label htmlFor="landing-hero" className="text-sm font-medium cursor-pointer">
                  히어로 섹션 정상 표시
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="landing-search"
                  checked={checklist.landing.search}
                  onCheckedChange={() => toggleCheck('landing', 'search')}
                />
                <label htmlFor="landing-search" className="text-sm font-medium cursor-pointer">
                  검색바 동작 확인
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="landing-howItWorks"
                  checked={checklist.landing.howItWorks}
                  onCheckedChange={() => toggleCheck('landing', 'howItWorks')}
                />
                <label htmlFor="landing-howItWorks" className="text-sm font-medium cursor-pointer">
                  이용방법 섹션 표시
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="landing-featured"
                  checked={checklist.landing.featured}
                  onCheckedChange={() => toggleCheck('landing', 'featured')}
                />
                <label htmlFor="landing-featured" className="text-sm font-medium cursor-pointer">
                  추천 숙소 섹션 표시 (실제 데이터 연동)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="landing-responsive"
                  checked={checklist.landing.responsive}
                  onCheckedChange={() => toggleCheck('landing', 'responsive')}
                />
                <label htmlFor="landing-responsive" className="text-sm font-medium cursor-pointer">
                  반응형 디자인 (모바일/태블릿/PC)
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auth */}
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>사용자 인증 (Clerk)</CardTitle>
                  <CardDescription>로그인 및 회원가입</CardDescription>
                </div>
                <Badge variant={getCategoryProgress('auth').percentage === 100 ? "default" : "secondary"}>
                  {getCategoryProgress('auth').completed} / {getCategoryProgress('auth').total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auth-signup"
                  checked={checklist.auth.signup}
                  onCheckedChange={() => toggleCheck('auth', 'signup')}
                />
                <label htmlFor="auth-signup" className="text-sm font-medium cursor-pointer">
                  회원가입 동작
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auth-login"
                  checked={checklist.auth.login}
                  onCheckedChange={() => toggleCheck('auth', 'login')}
                />
                <label htmlFor="auth-login" className="text-sm font-medium cursor-pointer">
                  로그인/로그아웃 동작
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auth-social"
                  checked={checklist.auth.social}
                  onCheckedChange={() => toggleCheck('auth', 'social')}
                />
                <label htmlFor="auth-social" className="text-sm font-medium cursor-pointer">
                  소셜 로그인 (Google 등)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auth-profile"
                  checked={checklist.auth.profile}
                  onCheckedChange={() => toggleCheck('auth', 'profile')}
                />
                <label htmlFor="auth-profile" className="text-sm font-medium cursor-pointer">
                  사용자 프로필 표시
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explore */}
        <TabsContent value="explore">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>숙소 탐색</CardTitle>
                  <CardDescription>/explore 페이지</CardDescription>
                </div>
                <Badge variant={getCategoryProgress('explore').percentage === 100 ? "default" : "secondary"}>
                  {getCategoryProgress('explore').completed} / {getCategoryProgress('explore').total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="explore-list"
                  checked={checklist.explore.list}
                  onCheckedChange={() => toggleCheck('explore', 'list')}
                />
                <label htmlFor="explore-list" className="text-sm font-medium cursor-pointer">
                  숙소 목록 정상 표시
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="explore-tagFilter"
                  checked={checklist.explore.tagFilter}
                  onCheckedChange={() => toggleCheck('explore', 'tagFilter')}
                />
                <label htmlFor="explore-tagFilter" className="text-sm font-medium cursor-pointer">
                  태그 필터링 동작 (VIEW, ACTIVITY, FACILITY, VIBE)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="explore-search"
                  checked={checklist.explore.search}
                  onCheckedChange={() => toggleCheck('explore', 'search')}
                />
                <label htmlFor="explore-search" className="text-sm font-medium cursor-pointer">
                  검색 기능 동작
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="explore-clickDetail"
                  checked={checklist.explore.clickDetail}
                  onCheckedChange={() => toggleCheck('explore', 'clickDetail')}
                />
                <label htmlFor="explore-clickDetail" className="text-sm font-medium cursor-pointer">
                  숙소 카드 클릭 시 상세 페이지 이동
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="explore-images"
                  checked={checklist.explore.images}
                  onCheckedChange={() => toggleCheck('explore', 'images')}
                />
                <label htmlFor="explore-images" className="text-sm font-medium cursor-pointer">
                  이미지 정상 로드
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Detail */}
        <TabsContent value="propertyDetail">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>숙소 상세 페이지</CardTitle>
                  <CardDescription>/property/[id] 페이지</CardDescription>
                </div>
                <Badge variant={getCategoryProgress('propertyDetail').percentage === 100 ? "default" : "secondary"}>
                  {getCategoryProgress('propertyDetail').completed} / {getCategoryProgress('propertyDetail').total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="propertyDetail-info"
                  checked={checklist.propertyDetail.info}
                  onCheckedChange={() => toggleCheck('propertyDetail', 'info')}
                />
                <label htmlFor="propertyDetail-info" className="text-sm font-medium cursor-pointer">
                  숙소 정보 정확히 표시
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="propertyDetail-gallery"
                  checked={checklist.propertyDetail.gallery}
                  onCheckedChange={() => toggleCheck('propertyDetail', 'gallery')}
                />
                <label htmlFor="propertyDetail-gallery" className="text-sm font-medium cursor-pointer">
                  이미지 갤러리 동작
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="propertyDetail-hostInfo"
                  checked={checklist.propertyDetail.hostInfo}
                  onCheckedChange={() => toggleCheck('propertyDetail', 'hostInfo')}
                />
                <label htmlFor="propertyDetail-hostInfo" className="text-sm font-medium cursor-pointer">
                  호스트 정보 표시
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="propertyDetail-tags"
                  checked={checklist.propertyDetail.tags}
                  onCheckedChange={() => toggleCheck('propertyDetail', 'tags')}
                />
                <label htmlFor="propertyDetail-tags" className="text-sm font-medium cursor-pointer">
                  태그 표시
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="propertyDetail-related"
                  checked={checklist.propertyDetail.related}
                  onCheckedChange={() => toggleCheck('propertyDetail', 'related')}
                />
                <label htmlFor="propertyDetail-related" className="text-sm font-medium cursor-pointer">
                  관련 숙소 추천
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Host */}
        <TabsContent value="host">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>호스트 기능</CardTitle>
                  <CardDescription>숙소 등록 및 관리</CardDescription>
                </div>
                <Badge variant={getCategoryProgress('host').percentage === 100 ? "default" : "secondary"}>
                  {getCategoryProgress('host').completed} / {getCategoryProgress('host').total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="host-becomeHost"
                  checked={checklist.host.becomeHost}
                  onCheckedChange={() => toggleCheck('host', 'becomeHost')}
                />
                <label htmlFor="host-becomeHost" className="text-sm font-medium cursor-pointer">
                  호스트 신청 폼 동작
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="host-registration"
                  checked={checklist.host.registration}
                  onCheckedChange={() => toggleCheck('host', 'registration')}
                />
                <label htmlFor="host-registration" className="text-sm font-medium cursor-pointer">
                  숙소 등록 기능
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="host-imageUpload"
                  checked={checklist.host.imageUpload}
                  onCheckedChange={() => toggleCheck('host', 'imageUpload')}
                />
                <label htmlFor="host-imageUpload" className="text-sm font-medium cursor-pointer">
                  이미지 업로드 및 Gemini AI 최적화
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="host-myProperties"
                  checked={checklist.host.myProperties}
                  onCheckedChange={() => toggleCheck('host', 'myProperties')}
                />
                <label htmlFor="host-myProperties" className="text-sm font-medium cursor-pointer">
                  내 숙소 관리 (목록, 수정)
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin */}
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>관리자 기능</CardTitle>
                  <CardDescription>QR 로그인 및 숙소 승인</CardDescription>
                </div>
                <Badge variant={getCategoryProgress('admin').percentage === 100 ? "default" : "secondary"}>
                  {getCategoryProgress('admin').completed} / {getCategoryProgress('admin').total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-qrLogin"
                  checked={checklist.admin.qrLogin}
                  onCheckedChange={() => toggleCheck('admin', 'qrLogin')}
                />
                <label htmlFor="admin-qrLogin" className="text-sm font-medium cursor-pointer">
                  QR 코드 생성 및 만료 타이머 (5분)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-phoneInput"
                  checked={checklist.admin.phoneInput}
                  onCheckedChange={() => toggleCheck('admin', 'phoneInput')}
                />
                <label htmlFor="admin-phoneInput" className="text-sm font-medium cursor-pointer">
                  핸드폰 번호 입력 및 인증 (010-5470-8008, 010-899-41584)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-autoLogin"
                  checked={checklist.admin.autoLogin}
                  onCheckedChange={() => toggleCheck('admin', 'autoLogin')}
                />
                <label htmlFor="admin-autoLogin" className="text-sm font-medium cursor-pointer">
                  PC 자동 로그인 및 리디렉션
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-approval"
                  checked={checklist.admin.approval}
                  onCheckedChange={() => toggleCheck('admin', 'approval')}
                />
                <label htmlFor="admin-approval" className="text-sm font-medium cursor-pointer">
                  숙소 승인/거부 기능
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Issue Reporting Guide */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            이슈 리포팅 방법
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">우선순위</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">🔴 긴급</Badge>
                <span className="text-sm">서비스 사용 불가 (로그인 안됨, 결제 오류 등)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">🟠 높음</Badge>
                <span className="text-sm">핵심 기능 문제 (숙소 검색 오류 등)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">🟡 중간</Badge>
                <span className="text-sm">부가 기능 문제 (이미지 로딩 느림 등)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">🟢 낮음</Badge>
                <span className="text-sm">UI 개선, 오타 수정 등</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">연락처</h3>
            <p className="text-sm text-gray-600">
              이슈 발견 시 <code className="bg-gray-100 px-2 py-1 rounded">CLIENT_REVIEW_CHECKLIST.md</code> 파일의 템플릿을 사용하여 상세히 작성해주세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">주요 페이지</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/" className="block text-primary hover:underline">랜딩 페이지</a>
            <a href="/explore" className="block text-primary hover:underline">숙소 탐색</a>
            <a href="/become-a-host" className="block text-primary hover:underline">호스트 되기</a>
            <a href="/admin/login" className="block text-primary hover:underline">관리자 로그인</a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">테스트 계정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">관리자 전화번호</p>
              <p className="text-xs text-gray-600">010-5470-8008</p>
              <p className="text-xs text-gray-600">010-899-41584</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">문서</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/docs/CLAUDE.md" className="block text-primary hover:underline">프로젝트 문서</a>
            <a href="/docs/PRD.md" className="block text-primary hover:underline">제품 요구사항</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
