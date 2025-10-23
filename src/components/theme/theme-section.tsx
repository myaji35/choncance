import type { Theme, Property } from "@/types";
import { PropertyCard } from "@/components/property/property-card";

interface ThemeSectionProps {
  theme: Theme;
  properties: Property[];
}

export function ThemeSection({ theme, properties }: ThemeSectionProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">{theme.title}</h2>
        <p className="text-lg text-gray-600">{theme.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
