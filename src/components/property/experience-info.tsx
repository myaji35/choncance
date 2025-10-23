import type { Experience } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import * as Icons from "lucide-react";

interface ExperienceInfoProps {
  experiences: Experience[];
  providedItems: string[];
}

export function ExperienceInfo({ experiences, providedItems }: ExperienceInfoProps) {
  if (experiences.length === 0 && providedItems.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">체험 정보</h2>

      {/* Experiences */}
      {experiences.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiences.map((experience) => {
            const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[experience.iconName] || Icons.Star;
            return (
              <Card key={experience.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-primary">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{experience.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {experience.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      {/* Provided Items */}
      {providedItems.length > 0 && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">제공 품목</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {providedItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
