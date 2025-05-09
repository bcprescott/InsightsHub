import { SectionHeader } from '@/components/shared/SectionHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { mockResources } from '@/lib/data';
import type { LearningResource } from '@/types';
// Placeholder for potential filtering/sorting controls
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

export default async function ResourcesPage({ searchParams }: { searchParams?: { trendId?: string, type?: string, tag?: string, query?: string }}) {
  let resources: LearningResource[] = mockResources;

  // Example filtering logic (can be expanded)
  if (searchParams?.trendId) {
    resources = resources.filter(r => r.trendId === searchParams.trendId);
  }
  if (searchParams?.type) {
    resources = resources.filter(r => r.type.toLowerCase() === searchParams.type?.toLowerCase());
  }
  if (searchParams?.tag) {
    resources = resources.filter(r => r.tags.map(t => t.toLowerCase()).includes(searchParams.tag?.toLowerCase() || ''));
  }

  if (searchParams?.query) {
    const query = searchParams.query.toLowerCase();
    resources = resources.filter(resource => 
      resource.title.toLowerCase().includes(query) ||
      (resource.summary && resource.summary.toLowerCase().includes(query)) ||
      (resource.source && resource.source.toLowerCase().includes(query)) ||
      resource.type.toLowerCase().includes(query) ||
      resource.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return (
    <div className="container mx-auto pt-0 pb-8 px-4 md:px-0">
      <SectionHeader
        title="Learning & Resource Curation"
        description="Curated learning paths and resources to help you stay updated on key AI trends. (Ratings are illustrative)."
      />
      <SearchBar placeholder="Search resources by title, tag, type..." initialQuery={searchParams?.query || ''}/>
      
      {/* Add Filter Controls here if needed
      <div className="mb-6 flex gap-4">
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paper">Paper</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="course">Course</SelectItem>
          </SelectContent>
        </Select>
      </div>
      */}

      {resources.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No learning resources found matching your criteria.</p>
          <p className="text-sm text-muted-foreground">Try different search terms or filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
