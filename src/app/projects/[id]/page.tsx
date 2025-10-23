import { ProjectDetailsClientPage } from "./project-details-client-page";

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const projectId = params.id;

  // Placeholder for project and task data. In a real app, you'd fetch this.
  const project = { id: projectId, name: `프로젝트 ${projectId}`, description: `프로젝트 ${projectId}에 대한 설명입니다.` };
  const tasks = [
    { id: 't1', name: '작업 1', dueDate: '2023-10-26', status: 'Todo' },
    { id: 't2', name: '작업 2', dueDate: '2023-10-27', status: 'In Progress' },
    { id: 't3', name: '작업 3', dueDate: '2023-10-28', status: 'Done' },
  ];

  return (
    <div className="container mx-auto p-4">
      <ProjectDetailsClientPage project={project} tasks={tasks} />
    </div>
  );
}
