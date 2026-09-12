import { interpolate, useCurrentFrame } from 'remotion';

export interface SaveTheDateVideoProps {
  names: string;
  date: string;
  location: string;
  lang: string;
}

const localizedVideoCopy: Record<string, { save: string; date: string; location: string }> = {
  it: { save: 'Save the Date', date: 'Data', location: 'Luogo' },
  en: { save: 'Save the Date', date: 'Date', location: 'Location' },
  es: { save: 'Reserva la fecha', date: 'Fecha', location: 'Lugar' },
  fr: { save: 'Save the Date', date: 'Date', location: 'Lieu' },
  de: { save: 'Save the Date', date: 'Datum', location: 'Ort' },
};

function SaveTheDateVideo({ names, date, location, lang }: SaveTheDateVideoProps) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const labels = localizedVideoCopy[lang] || localizedVideoCopy.it;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #A3B59D 0%, #fff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'serif',
      color: '#333',
    }}>
      <h1 style={{ fontSize: 70, fontWeight: 700, opacity }}>{labels.save}</h1>
      <h2 style={{ fontSize: 48, margin: '32px 0 0 0', opacity }}>{names}</h2>
      <div style={{ fontSize: 32, marginTop: 24, opacity }}>{labels.date}: {date}</div>
      <div style={{ fontSize: 32, marginTop: 8, opacity }}>{labels.location}: {location}</div>
    </div>
  );
}

export default SaveTheDateVideo;
