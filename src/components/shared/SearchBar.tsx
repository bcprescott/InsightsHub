'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialQuery?: string;
}

export function SearchBar({ onSearch, placeholder = "Search...", className, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setQuery(initialQuery);
    }
  }, [initialQuery, isMounted]);


  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };
  
  if (!isMounted) {
    return (
      <div className={cn("flex w-full max-w-xl items-center space-x-2 mb-6", className)}>
        <div className="relative flex-1 h-10 bg-muted rounded-lg animate-pulse"></div>
        <div className="h-10 w-20 bg-muted rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSearch} className={cn("flex w-full max-w-xl items-center space-x-2 mb-6", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button type="submit" variant="outline">Search</Button>
    </form>
  );
}
