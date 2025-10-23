'use server';

export async function handleCreateTask(data: { name: string; description: string }) {
  console.log("Create task:", data);
  // Add your database logic here
}

export async function handleEditTask(data: { name: string; description: string }) {
  console.log("Edit task:", data);
  // Add your database logic here
}
