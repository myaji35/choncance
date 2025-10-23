'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { handleCreateTask, handleEditTask } from "./actions";

// Define simple types for the props based on the placeholder data
interface Project {
  id: string;
  name: string;
  description: string;
}

interface Task {
  id: string;
  name: string;
  dueDate: string;
  status: string;
}

interface ProjectDetailsClientPageProps {
  project: Project;
  tasks: Task[];
}

export function ProjectDetailsClientPage({ project, tasks }: ProjectDetailsClientPageProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <TaskFormDialog
          title="새 작업 생성"
          description="새로운 작업의 이름과 설명을 입력하세요."
          onSubmit={handleCreateTask}
        >
          <Button>새 작업</Button>
        </TaskFormDialog>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-8">{project.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {task.name}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">메뉴 열기</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <TaskFormDialog
                      title="작업 수정"
                      description="작업의 이름과 설명을 수정하세요."
                      initialData={{ name: task.name, description: "" }}
                      onSubmit={handleEditTask}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>수정</DropdownMenuItem>
                    </TaskFormDialog>
                    <DropdownMenuItem>삭제</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
              <CardDescription>마감일: {task.dueDate} | 상태: {task.status}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Task details can go here */}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
