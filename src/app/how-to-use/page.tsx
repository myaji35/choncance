"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Calendar,
  CreditCard,
  Home,
  MessageSquare,
  Star,
  UserPlus,
  Upload,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Shield,
  HeartHandshake,
} from "lucide-react";

export default function HowToUsePage() {
  const [activeTab, setActiveTab] = useState("guest");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">이용 가이드</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ChonCance 이용 방법
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              촌캉스 예약부터 호스트 등록까지, 모든 것을 쉽고 간단하게
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 게스트/호스트 선택 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="guest">게스트 가이드</TabsTrigger>
            <TabsTrigger value="host">호스트 가이드</TabsTrigger>
          </TabsList>

          {/* 게스트 가이드 */}
          <TabsContent value="guest" className="space-y-12">
            {/* 예약 프로세스 */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                예약하는 방법
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: Search,
                    step: "1단계",
                    title: "숙소 찾기",
                    description: "테마, 지역, 날짜로 원하는 숙소를 검색하세요",
                    link: "/explore",
                  },
                  {
                    icon: Calendar,
                    step: "2단계",
                    title: "날짜 선택",
                    description: "원하는 날짜와 인원을 선택하고 예약하기를 클릭하세요",
                  },
                  {
                    icon: CreditCard,
                    step: "3단계",
                    title: "결제하기",
                    description: "예약 정보를 확인하고 안전하게 결제하세요",
                  },
                  {
                    icon: CheckCircle2,
                    step: "4단계",
                    title: "예약 완료",
                    description: "예약 확인 메일을 받고 여행을 준비하세요",
                  },
                ].map((item, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <item.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-sm font-semibold text-primary mb-2">{item.step}</div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600">
                        {item.description}
                      </CardDescription>
                      {item.link && (
                        <Link href={item.link}>
                          <Button variant="outline" size="sm" className="mt-4">
                            시작하기
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 게스트 주요 기능 */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                게스트 주요 기능
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  {
                    icon: Search,
                    title: "태그 검색",
                    description: "#논뷰맛집, #불멍과별멍 등 원하는 테마로 쉽게 찾아보세요",
                  },
                  {
                    icon: HeartHandshake,
                    title: "위시리스트",
                    description: "마음에 드는 숙소를 저장하고 나중에 다시 확인하세요",
                  },
                  {
                    icon: Star,
                    title: "후기 작성",
                    description: "여행 후 솔직한 후기를 남겨 다른 여행자를 도와주세요",
                  },
                ].map((feature, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <feature.icon className="w-10 h-10 text-primary mb-3" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 게스트 팁 */}
            <section className="bg-blue-50 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                💡 예약 전 확인하세요
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {[
                  "취소 정책을 반드시 확인하세요",
                  "체크인/체크아웃 시간을 미리 확인하세요",
                  "특별 요청사항은 예약 시 남겨주세요",
                  "농촌 지역 특성상 교통편을 미리 준비하세요",
                  "반려동물 동반 시 호스트에게 사전 문의하세요",
                  "겨울철에는 방한 준비를 철저히 하세요",
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* 호스트 가이드 */}
          <TabsContent value="host" className="space-y-12">
            {/* 호스트 등록 프로세스 */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                호스트 되는 방법
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: UserPlus,
                    step: "1단계",
                    title: "호스트 신청",
                    description: "기본 정보와 사업자 정보를 입력하고 호스트를 신청하세요",
                    link: "/become-a-host",
                  },
                  {
                    icon: Upload,
                    step: "2단계",
                    title: "숙소 등록",
                    description: "숙소 정보, 사진, 편의시설, 태그를 등록하세요",
                  },
                  {
                    icon: Shield,
                    step: "3단계",
                    title: "승인 대기",
                    description: "관리자 승인 후 숙소가 공개됩니다",
                  },
                  {
                    icon: Home,
                    step: "4단계",
                    title: "예약 관리",
                    description: "예약을 확인하고 게스트를 맞이하세요",
                  },
                ].map((item, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <item.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-sm font-semibold text-primary mb-2">{item.step}</div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600">
                        {item.description}
                      </CardDescription>
                      {item.link && (
                        <Link href={item.link}>
                          <Button variant="outline" size="sm" className="mt-4">
                            시작하기
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 호스트 주요 기능 */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                호스트 주요 기능
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  {
                    icon: Home,
                    title: "숙소 관리",
                    description: "숙소 정보, 사진, 가격, 가용성을 쉽게 관리하세요",
                  },
                  {
                    icon: Calendar,
                    title: "예약 관리",
                    description: "예약 승인, 취소, 일정을 한눈에 확인하세요",
                  },
                  {
                    icon: MessageSquare,
                    title: "후기 답글",
                    description: "게스트의 후기에 답글을 남겨 소통하세요",
                  },
                ].map((feature, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <feature.icon className="w-10 h-10 text-primary mb-3" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 호스트 팁 */}
            <section className="bg-green-50 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                💡 성공적인 호스팅 팁
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {[
                  "고품질 사진으로 숙소의 매력을 보여주세요",
                  "호스트 스토리에 진정성을 담아주세요",
                  "정확한 편의시설과 불편함을 솔직하게 표시하세요",
                  "적절한 태그를 선택해 노출을 높이세요",
                  "빠른 예약 확인과 친절한 응대가 중요합니다",
                  "게스트 후기에 성실하게 답변하세요",
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* FAQ 섹션 */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
            <p className="text-gray-600">궁금하신 내용을 빠르게 확인하세요</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {/* 일반 */}
            <AccordionItem value="faq-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-gray-900">ChonCance는 어떤 서비스인가요?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                ChonCance는 한국의 아름다운 농촌 지역에서 휴가를 즐길 수 있도록 돕는 촌캉스 큐레이션 플랫폼입니다.
                테마 기반 검색으로 원하는 분위기의 숙소를 쉽게 찾고, 호스트의 진정성 있는 스토리를 통해 특별한 경험을 예약할 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-gray-900">회원가입이 필수인가요?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                숙소 탐색과 정보 확인은 회원가입 없이 가능합니다. 다만 예약, 위시리스트, 후기 작성 등의 기능을 이용하려면
                회원가입이 필요합니다. 간편하게 이메일이나 소셜 계정으로 가입할 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            {/* 예약 관련 */}
            <AccordionItem value="faq-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-gray-900">예약은 어떻게 하나요?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                1. 원하는 숙소를 선택하고 날짜와 인원을 입력합니다.
                <br />
                2. 예약자 정보를 입력하고 결제를 진행합니다.
                <br />
                3. 결제 완료 후 예약 확인 메일을 받게 됩니다.
                <br />
                4. 내 예약 페이지에서 언제든 예약 정보를 확인할 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-gray-900">예약 취소는 어떻게 하나요?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                내 예약 페이지에서 예약 취소를 요청할 수 있습니다. 취소 정책은 숙소마다 다르므로 예약 전 반드시 확인해주세요.
                일반적으로 체크인 7일 전까지는 전액 환불이 가능하며, 그 이후에는 부분 환불 또는 환불 불가일 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-gray-900">결제 수단은 무엇이 있나요?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                토스페이먼츠를 통해 신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등) 등 다양한 결제 수단을 지원합니다.
                모든 결제는 안전하게 암호화되어 처리됩니다.
              </AccordionContent>
            </AccordionItem>

            {/* 호스트 관련 */}
            <AccordionItem value="faq-6" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-gray-900">호스트가 되려면 어떻게 해야 하나요?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                &ldquo;호스트 되기&rdquo; 페이지에서 신청할 수 있습니다. 기본 정보와 사업자 정보를 입력하고, 관리자 승인을 받으면
                숙소를 등록할 수 있습니다. 개인 사업자 또는 법인 모두 가능합니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-7" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-gray-900">호스트 수수료는 얼마인가요?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                예약 금액의 10% (VAT 별도)를 플랫폼 수수료로 받고 있습니다. 결제 수수료는 별도로 부과됩니다.
                정확한 정산 금액은 호스트 대시보드에서 확인할 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            {/* 기타 */}
            <AccordionItem value="faq-8" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-gray-900">반려동물을 데려갈 수 있나요?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                #반려동물동반 태그가 있는 숙소에서만 반려동물 동반이 가능합니다. 숙소마다 반려동물 정책이 다르므로
                예약 전 상세 정보를 확인하거나 호스트에게 문의해주세요. 일부 숙소는 반려동물 추가 요금이 있을 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-9" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-gray-900">문의는 어떻게 하나요?</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                고객센터 이메일(support@choncance.com)로 문의해주시면 빠르게 답변드리겠습니다.
                영업일 기준 24시간 이내에 답변을 받으실 수 있습니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA 섹션 */}
        <section className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            아직 궁금한 점이 있으신가요?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            더 자세한 정보가 필요하시거나 직접 문의하고 싶으시다면 언제든지 연락주세요
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/explore">
              <Button size="lg" className="gap-2">
                <Search className="w-5 h-5" />
                숙소 둘러보기
              </Button>
            </Link>
            <Link href="/become-a-host">
              <Button size="lg" variant="outline" className="gap-2">
                <Home className="w-5 h-5" />
                호스트 되기
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
