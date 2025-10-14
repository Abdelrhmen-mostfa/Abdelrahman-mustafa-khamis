import React from 'react';

const ConfettiPiece = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute w-2 h-4" style={style}></div>
);

const Confetti: React.FC = () => {
  const confettiCount = 100;

  // Define keyframes once as a string to avoid re-creating on every render
  const keyframes = `
    @keyframes fall {
      0% {
        transform: translateY(-10vh) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(110vh) rotate(720deg);
        opacity: 0;
      }
    }
  `;

  const pieces = Array.from({ length: confettiCount }).map((_, index) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}%`,
      animation: `fall ${Math.random() * 3 + 4}s linear ${Math.random() * 5}s infinite`,
      backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
      transform: `rotate(${Math.random() * 360}deg)`,
      width: `${Math.floor(Math.random() * 5) + 5}px`,
      height: `${Math.floor(Math.random() * 10) + 5}px`,
    };
    return <ConfettiPiece key={index} style={style} />;
  });

  return (
    <>
      <style>{keyframes}</style>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
        {pieces}
      </div>
    </>
  );
};

export default Confetti;