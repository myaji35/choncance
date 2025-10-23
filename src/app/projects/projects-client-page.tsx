'use client';

import { Button } from "@/components/ui/button";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import { handleAddProject } from "./actions"; // Import the server action

export function ProjectsClientPage() {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold">내 프로젝트</h1>
      <ProjectFormDialog
        title="새 프로젝트 추가"
        description="새로운 프로젝트의 이름과 설명을 입력하세요."
        onSubmit={handleAddProject} // Use the imported server action
      >
        <Button>새 프로젝트</Button>
      </ProjectFormDialog>
    </div>
  );
}
