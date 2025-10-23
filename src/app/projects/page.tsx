import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import Image from "next/image";

export default function ProjectsPage() {
  const handleAddProject = (data: { name: string; description: string }) => {
    console.log("New project added:", data);
    // In a real application, you would send this data to your backend
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">내 프로젝트</h1>
        <ProjectFormDialog
          title="새 프로젝트 추가"
          description="새로운 프로젝트의 이름과 설명을 입력하세요."
          onSubmit={handleAddProject}
        >
          <Button>새 프로젝트</Button>
        </ProjectFormDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Placeholder Project Cards */}
        <Card className="overflow-hidden">
          <Image
            src="/placeholder-project-1.jpg"
            alt="프로젝트 1"
            width={400}
            height={250}
            className="w-full h-48 object-cover"
          />
          <CardHeader>
            <CardTitle>촌캉스 플랫폼 개발</CardTitle>
            <CardDescription>MVP 기능 개발 및 배포.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0">자세히 보기</Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <Image
            src="/placeholder-project-2.jpg"
            alt="프로젝트 2"
            width={400}
            height={250}
            className="w-full h-48 object-cover"
          />
          <CardHeader>
            <CardTitle>마케팅 전략 수립</CardTitle>
            <CardDescription>MZ세대 타겟 마케팅 전략.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0">자세히 보기</Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <Image
            src="/placeholder-project-3.jpg"
            alt="프로젝트 3"
            width={400}
            height={250}
            className="w-full h-48 object-cover"
          />
          <CardHeader>
            <CardTitle>호스트 발굴 및 온보딩</CardTitle>
            <CardDescription>진정성 있는 호스트 모집.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0">자세히 보기</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}