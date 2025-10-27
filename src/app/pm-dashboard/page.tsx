"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, BookOpen, ListTodo, TrendingUp } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    prds: number;
    epics: number;
    stories: number;
  };
}

export default function PMDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/pm/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("프로젝트 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    const name = prompt("새 프로젝트 이름을 입력하세요:");
    if (!name) return;

    const description = prompt("프로젝트 설명을 입력하세요 (선택사항):");

    try {
      const response = await fetch("/api/pm/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/pm-dashboard/projects/${data.project.id}`);
      } else {
        alert("프로젝트 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로젝트 생성 오류:", error);
      alert("프로젝트 생성 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">PM 대시보드</h1>
          <p className="text-muted-foreground">
            제품 요구사항, Epic, User Story를 관리하세요
          </p>
        </div>
        <Button onClick={createNewProject} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          새 프로젝트
        </Button>
      </div>

      {/* PM Tools 소개 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-blue-500" />
            <CardTitle>PRD 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              제품 요구사항 문서를 체계적으로 작성하세요
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 mb-2 text-green-500" />
            <CardTitle>Epic 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              대규모 기능을 Epic으로 구조화하세요
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ListTodo className="h-8 w-8 mb-2 text-purple-500" />
            <CardTitle>Story 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              User Story와 AC를 상세하게 정의하세요
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 mb-2 text-orange-500" />
            <CardTitle>Course Correction</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              프로젝트 방향을 분석하고 조정하세요
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 프로젝트 목록 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">내 프로젝트</h2>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                아직 프로젝트가 없습니다.
              </p>
              <Button onClick={createNewProject}>
                <Plus className="mr-2 h-4 w-4" />
                첫 프로젝트 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/pm-dashboard/projects/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{project._count.prds} PRD</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{project._count.epics} Epic</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ListTodo className="h-4 w-4" />
                      <span>{project._count.stories} Story</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    마지막 수정: {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
