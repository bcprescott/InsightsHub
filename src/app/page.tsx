import TrendsPage from './trends/page';

// The main page will now serve as the dashboard, which is the Trends page.
// Passing searchParams to allow search functionality on the homepage as well.
export default async function HomePage({ searchParams }: { searchParams?: { query?: string }}) {
  return <TrendsPage searchParams={searchParams} />;
}
