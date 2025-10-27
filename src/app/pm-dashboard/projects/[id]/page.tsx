"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Edit, Trash2 } from "lucide-react";

interface PRD {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  _count?: {
    epics: number;
    requirements: number;
  };
}

interface Epic {
  id: string;
  number: number;
  title: string;
  type: string;
  status: string;
  _count?: {
    stories: number;
  };
}

interface Story {
  id: string;
  epicNumber: number;
  storyNumber: number;
  title: string;
  status: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  prds: PRD[];
  epics: Epic[];
  stories: Story[];
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/pm/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error("프로젝트 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportPRD = async (prdId: string) => {
    try {
      const response = await fetch(`/api/pm/export/prd/${prdId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prd-${prdId}.md`;
        a.click();
      }
    } catch (error) {
      console.error("PRD 내보내기 오류:", error);
    }
  };

  const exportEpic = async (epicId: string) => {
    try {
      const response = await fetch(`/api/pm/export/epic/${epicId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `epic-${epicId}.md`;
        a.click();
      }
    } catch (error) {
      console.error("Epic 내보내기 오류:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500";
      case "review":
        return "bg-blue-500";
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-purple-500";
      case "completed":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">프로젝트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/pm-dashboard")}>
            ← 대시보드로
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prds">
            PRD ({project.prds.length})
          </TabsTrigger>
          <TabsTrigger value="epics">
            Epics ({project.epics.length})
          </TabsTrigger>
          <TabsTrigger value="stories">
            Stories ({project.stories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prds" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">제품 요구사항 문서 (PRD)</h2>
            <Button onClick={() => router.push(`/pm-dashboard/create-prd?projectId=${params.id}`)}>
              <Plus className="mr-2 h-4 w-4" />
              새 PRD 작성
            </Button>
          </div>

          {project.prds.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  PRD가 없습니다. 새로운 PRD를 작성해보세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {project.prds.map((prd) => (
                <Card key={prd.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {prd.title}
                          <Badge className={getStatusColor(prd.status)}>
                            {prd.status}
                          </Badge>
                          <Badge variant="outline">{prd.type}</Badge>
                        </CardTitle>
                        <CardDescription>
                          생성일: {new Date(prd.createdAt).toLocaleDateString('ko-KR')}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportPRD(prd.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/pm-dashboard/prds/${prd.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="epics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Epics</h2>
            <Button onClick={() => router.push(`/pm-dashboard/create-epic?projectId=${params.id}`)}>
              <Plus className="mr-2 h-4 w-4" />
              새 Epic 작성
            </Button>
          </div>

          {project.epics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Epic이 없습니다. 새로운 Epic을 작성해보세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {project.epics.map((epic) => (
                <Card key={epic.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Epic {epic.number}: {epic.title}
                          <Badge className={getStatusColor(epic.status)}>
                            {epic.status}
                          </Badge>
                          <Badge variant="outline">{epic.type}</Badge>
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportEpic(epic.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/pm-dashboard/epics/${epic.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Stories</h2>
            <Button onClick={() => router.push(`/pm-dashboard/create-story?projectId=${params.id}`)}>
              <Plus className="mr-2 h-4 w-4" />
              새 Story 작성
            </Button>
          </div>

          {project.stories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Story가 없습니다. 새로운 Story를 작성해보세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {project.stories.map((story) => (
                <Card key={story.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Story {story.epicNumber}.{story.storyNumber}: {story.title}
                          <Badge className={getStatusColor(story.status)}>
                            {story.status}
                          </Badge>
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/pm-dashboard/stories/${story.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
