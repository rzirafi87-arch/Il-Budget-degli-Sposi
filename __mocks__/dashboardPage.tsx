import React from 'react';

export default function DashboardPageMock() {
  if (
    !globalThis.localStorage?.getItem('language') ||
    !globalThis.localStorage?.getItem('country') ||
    !globalThis.localStorage?.getItem('eventType')
  ) {
    return (
      <div>
        <h2>Seleziona lingua, nazione ed evento</h2>
      </div>
    );
  }
  return <div>Dashboard</div>;
}

