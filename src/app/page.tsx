import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
        <div className="text-2xl font-bold tracking-tight text-primary">촌캉스</div>
        <nav className="hidden md:flex space-x-6">
          <Link href="#themes" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">테마</Link>
          <Link href="#experiences" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">체험</Link>
          <Link href="#stories" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">스토리</Link>
        </nav>
        <div className="space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/login">로그인</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">회원가입</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('/placeholder-hero.jpg')" }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-white p-6 max-w-4xl w-full">
          <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight tracking-wide">
            진짜 촌캉스를 찾아서
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-light tracking-wide">
            논뷰 맛집부터 할매니얼 감성까지, <br />
            나만의 힐링 스토리가 시작됩니다
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="원하는 테마나 지역을 검색해보세요..."
              className="w-full sm:flex-1 p-4 rounded-lg text-gray-900 border-0"
            />
            <Button size="lg" className="sm:w-auto px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
              탐색하기
            </Button>
          </div>
        </div>
      </section>

      {/* Theme Section */}
      <section id="themes" className="py-20 px-6 md:px-12 lg:px-20 bg-white dark:bg-gray-950">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-4 text-gray-800 dark:text-gray-100">감성 테마</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg">당신의 마음이 이끄는 곳으로</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-64">
                <Image src="/placeholder-property-1.jpg" alt="논뷰 맛집" fill className="object-cover" />
              </div>
              <div className="p-6">
                <CardTitle className="text-2xl mb-2 font-light">#논뷰맛집</CardTitle>
                <CardDescription className="text-base">멍때리기 좋은 황금빛 논밭 풍경</CardDescription>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-64">
                <Image src="/placeholder-property-2.jpg" alt="불멍과 별멍" fill className="object-cover" />
              </div>
              <div className="p-6">
                <CardTitle className="text-2xl mb-2 font-light">#불멍과별멍</CardTitle>
                <CardDescription className="text-base">모닥불 앞에서 누리는 완벽한 단절</CardDescription>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="relative h-64">
                <Image src="/placeholder-property-3.jpg" alt="할매니얼" fill className="object-cover" />
              </div>
              <div className="p-6">
                <CardTitle className="text-2xl mb-2 font-light">#찐할머니손맛</CardTitle>
                <CardDescription className="text-base">할머니의 손맛이 담긴 시골 밥상</CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experiences" className="py-20 px-6 md:px-12 lg:px-20 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-4 text-gray-800 dark:text-gray-100">느리고 진짜인 체험</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg">몸빼바지를 입고 떠나는 로컬 스토리</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="relative h-80">
                <Image src="/placeholder-property-4.jpg" alt="아궁이 체험" fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">#아궁이체험</span>
                  <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">#장작패기</span>
                </div>
                <CardTitle className="text-xl mb-2 font-light">할머니와 함께하는 아궁이 밥짓기</CardTitle>
                <CardDescription className="text-base">장작을 패고 불을 지피는 아날로그 감성</CardDescription>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="relative h-80">
                <Image src="/placeholder-property-5.jpg" alt="텃밭 체험" fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">#텃밭수확</span>
                  <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">#제철채소</span>
                </div>
                <CardTitle className="text-xl mb-2 font-light">싱싱한 제철 채소 수확 체험</CardTitle>
                <CardDescription className="text-base">직접 수확한 채소로 차려내는 저녁 식탁</CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Story Section */}
      <section id="stories" className="py-20 px-6 md:px-12 lg:px-20 bg-white dark:bg-gray-950">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-4 text-gray-800 dark:text-gray-100">진정성 있는 이야기</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg">호스트의 삶과 공간이 만나는 곳</p>
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-center text-xl md:text-2xl font-light text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            &ldquo;와이파이가 잘 안 터지고, 가끔 벌레도 나와요. <br />
            하지만 그게 바로 이곳의 매력이에요. <br />
            완벽한 단절, 진짜 쉼이 여기 있습니다.&rdquo;
          </blockquote>
          <p className="text-center text-gray-500 dark:text-gray-400">- 강원도 어느 한옥 스테이 호스트</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
        <h2 className="text-4xl md:text-5xl font-light mb-6">당신만의 촌캉스를 시작하세요</h2>
        <p className="text-lg md:text-xl mb-8 font-light">SNS에 공유하고 싶은 순간들이 기다리고 있습니다</p>
        <Button size="lg" variant="secondary" className="px-10 py-6 text-lg rounded-lg" asChild>
          <Link href="/explore">지금 탐색하기</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-20 bg-gray-900 dark:bg-black text-gray-300 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-2xl font-bold mb-6 text-white">촌캉스</div>
          <p className="text-sm mb-4">진짜 촌캉스를 찾아서</p>
          <p className="text-xs text-gray-500">&copy; 2025 ChonCance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
