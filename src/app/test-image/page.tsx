import { PropertyImage } from "@/components/property/property-image";

export default function TestImagePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Property Image Component Test</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PropertyImage src="/placeholder-property-1.jpg" alt="Property 1" />
        <PropertyImage src="/placeholder-property-2.jpg" alt="Property 2" />
        <PropertyImage src="/placeholder-property-3.jpg" alt="Property 3" />
      </div>
    </div>
  );
}
