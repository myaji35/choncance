import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface HonestGuideProps {
  honestGuide: string[];
}

export function HonestGuide({ honestGuide }: HonestGuideProps) {
  if (honestGuide.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">솔직한 안내</h2>
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <ul className="space-y-3">
            {honestGuide.map((guide, index) => (
              <li key={index} className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{guide}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
