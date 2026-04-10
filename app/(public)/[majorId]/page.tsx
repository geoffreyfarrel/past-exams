import { ReactNode } from 'react';

import Major from '@/app/components/major/major';

export default async function MajorPage({
  params,
}: {
  params: Promise<{ majorId: string }>;
}): Promise<ReactNode> {
  const { majorId } = await params;

  return <Major majorId={majorId} />;
}
