"use client";

import { useState } from "react";
import { FilterSidebar } from "./filter-sidebar";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Tag, TagCategory } from "@/types";

interface ExploreContentProps {
  tags: Record<TagCategory, Tag[]>;
  children: React.ReactNode;
  activeFilterCount?: number;
}

export function ExploreContent({ tags, children, activeFilterCount = 0 }: ExploreContentProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <FilterSidebar tags={tags} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  필터 {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>필터</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar tags={tags} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
