'use client';

import { Grid, GridItem } from '@/components/Grid';
import Button from '@/components/Button';

const mockCards = Array.from({ length: 8 }).map((_, index) => (
  <div
    key={index}
    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3"
  >
    <div className="h-32 rounded-lg bg-gray-100" />
    <h3 className="text-lg font-semibold text-gray-900">Card {index + 1}</h3>
    <p className="text-sm text-gray-600">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
    </p>
    <Button variant="secondary">Learn More</Button>
  </div>
));

export default function TestGridPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grid Component Showcase</h1>
            <p className="text-gray-600">Different column configurations adjusting to breakpoints.</p>
          </div>

          <Grid columns={{ base: 1, md: 2 }} gap="gap-4">
            {mockCards.slice(0, 4)}
          </Grid>

          <Grid columns={{ base: 1, md: 3 }} gap="gap-6">
            {mockCards.slice(0, 6)}
          </Grid>

          <Grid columns={{ base: 1, md: 2, lg: 4 }} gap="gap-4">
            {mockCards}
          </Grid>
        </section>
      </div>
    </main>
  );
}
