import HeroBanner from "../components/HeroBanner";
import ConcertGrid from "../components/ConcertGrid";
import HowItWorks from "../components/HowItWorks";
import { useConcerts } from "../hooks/useConcerts";

/**
 * HomePage — Landing page with hero banner and featured concerts (first 6).
 */
export default function HomePage() {
  const { concerts, loading, error } = useConcerts();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white">Loading concerts...</div>;
  }
  
  if (error) {
    return <div className="flex h-screen items-center justify-center text-pink-400">Error loading concerts: {error}</div>;
  }

  // Only show the first 6 concerts on the home page as "featured"
  const featuredConcerts = concerts.slice(0, 6);

  return (
    <>
      <HeroBanner concerts={concerts.filter(c => c.isFeatured)} />
      <ConcertGrid concerts={featuredConcerts} />
      <HowItWorks />
    </>
  );
}
