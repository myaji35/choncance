'use server';

export async function handleAddProject(data: { name: string; description: string }) {
  console.log("New project added:", data);
  // In a real application, you would send this data to your backend
  // For now, we'll just log it to the server console.
}
