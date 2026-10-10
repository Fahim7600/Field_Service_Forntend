"use client";

import { Layers, Wrench } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CategoriesTab } from "@/components/admin/categories-tab";
import { SkillsTab } from "@/components/admin/skills-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "skills" ? "skills" : "categories";

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (val === "categories") {
      params.delete("tab");
    } else {
      params.set("tab", val);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="space-y-6"
    >
      <TabsList className="grid grid-cols-2 w-full max-w-sm">
        <TabsTrigger value="categories" className="flex items-center gap-2">
          <Layers className="size-4" />
          <span>Categories</span>
        </TabsTrigger>
        <TabsTrigger value="skills" className="flex items-center gap-2">
          <Wrench className="size-4" />
          <span>Skills</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="focus-visible:outline-none">
        <CategoriesTab onSkillTabSwitch={() => handleTabChange("skills")} />
      </TabsContent>

      <TabsContent value="skills" className="focus-visible:outline-none">
        <SkillsTab />
      </TabsContent>
    </Tabs>
  );
}
