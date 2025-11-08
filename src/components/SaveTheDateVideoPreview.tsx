
import dynamic from 'next/dynamic';

type RemotionProps = {
  names: string;
  date: string;
  location: string;
  lang: string;
};

const RemotionRoot = dynamic<RemotionProps>(
  () => import('@/app/[locale]/(routes)/save-the-date/RemotionRoot'),
  { ssr: false }
);

interface SaveTheDateVideoPreviewProps {
  bride: string;
  groom: string;
  date: string;
  location: string;
  message?: string;
}

export default function SaveTheDateVideoPreview({ bride, groom, date, location }: SaveTheDateVideoPreviewProps) {
  // Demo: passa i dati al video Remotion
  return (
    <div className="w-full max-w-3xl aspect-video border rounded-xl overflow-hidden shadow-lg bg-white">
      <RemotionRoot names={`${bride} & ${groom}`} date={date} location={location} lang="it" />
    </div>
  );
}
