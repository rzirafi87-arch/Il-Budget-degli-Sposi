import React from "react";

// Componente base per animazione Save the Date (Remotion)
// In futuro si potrà personalizzare con props
export const SaveTheDateVideo: React.FC<{
  bride: string;
  groom: string;
  date: string;
  location: string;
  message: string;
}> = ({ bride, groom, date, location, message }) => {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "linear-gradient(135deg, #A3B59D 0%, #F9F9F9 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Playfair Display, serif",
      color: "#333"
    }}>
      <h1 style={{ fontSize: 60, marginBottom: 40 }}>Save the Date</h1>
      <h2 style={{ fontSize: 40, marginBottom: 20 }}>{bride} & {groom}</h2>
      <p style={{ fontSize: 32, marginBottom: 10 }}>{date}</p>
      <p style={{ fontSize: 28 }}>{location}</p>
      <div style={{ marginTop: 40, fontSize: 24, opacity: 0.7 }}>
        {message || "Saremo felici di condividere con voi il giorno più importante della nostra vita!"}
      </div>
    </div>
  );
};
