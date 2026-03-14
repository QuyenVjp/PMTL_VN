import { SectionTitle } from "@/components/ui/section-title";
import { SearchPanel } from "@/features/search/components/search-panel";

export default function SearchPage() {
  return (
    <section className="section-stack">
      <SectionTitle
        title="Search domain"
        description="Search projection duoc tach khoi source of truth de toi uu query va scale."
      />
      <SearchPanel />
    </section>
  );
}

