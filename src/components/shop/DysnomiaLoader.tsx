const LETTERS = ['D', 'Y', 'S', 'N', 'O', 'M', 'I', 'A'];

export default function DysnomiaLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: '4px' }}>
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '28px',
              fontWeight: 600,
              color: '#FBBE63',
              letterSpacing: '6px',
              opacity: 0,
              animation: `dysnomia-reveal 0.3s ease ${0.05 + i * 0.05}s forwards`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      <div
        style={{
          height: '2px',
          background: '#FBBE63',
          marginTop: '16px',
          width: 0,
          animation: 'dysnomia-line 0.5s ease 0.5s forwards',
        }}
      />
      <style>{`
        @keyframes dysnomia-reveal {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes dysnomia-line {
          0% { width: 0; }
          100% { width: 60px; }
        }
      `}</style>
    </div>
  );
}
