import type { LearningResource } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, Star, Tag, Clock, BookOpen, Users, CalendarDays } from 'lucide-react';

interface ResourceCardProps {
  resource: LearningResource;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold text-primary leading-tight">{resource.title}</CardTitle>
          <Badge variant="secondary" className="whitespace-nowrap shrink-0">{resource.type}</Badge>
        </div>
        {resource.source && <CardDescription>Source: {resource.source}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {resource.summary && <p className="text-sm text-muted-foreground">{resource.summary}</p>}
        
        <div className="space-y-1 text-xs text-muted-foreground">
          {resource.authors && resource.authors.length > 0 && (
            <p className="flex items-center"><Users className="h-3 w-3 mr-2" /> Authors: {resource.authors.join(', ')}</p>
          )}
          {resource.publicationDate && (
            <p className="flex items-center"><CalendarDays className="h-3 w-3 mr-2" /> Published: {resource.publicationDate}</p>
          )}
          {resource.timeCommitment && (
            <p className="flex items-center"><Clock className="h-3 w-3 mr-2" /> Effort: {resource.timeCommitment}</p>
          )}
          {resource.skillLevel && (
             <p className="flex items-center"><BookOpen className="h-3 w-3 mr-2" /> Level: {resource.skillLevel}</p>
          )}
        </div>

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {resource.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" /> {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {resource.rating && <StarRating rating={resource.rating} />}
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link href={resource.url} target="_blank" rel="noopener noreferrer">
            View Resource <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
