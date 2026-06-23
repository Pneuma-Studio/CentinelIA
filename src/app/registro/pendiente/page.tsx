import { Suspense } from 'react';
import PendienteContent from './PendienteContent';

export default function PendientePage() {
  return (
    <Suspense>
      <PendienteContent />
    </Suspense>
  );
}
