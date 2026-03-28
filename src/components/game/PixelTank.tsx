import React from 'react';

interface PixelTankProps {
  x: number;
  y: number;
  rotation: number;
  color: string;
  size?: number;
  isPlayer?: boolean;
}

const PixelTank: React.FC<PixelTankProps> = ({ x, y, rotation, color, size = 32, isPlayer = false }) => {
  const s = size / 32;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Tracks */}
      <rect x={-14*s} y={-12*s} width={6*s} height={24*s} fill={isPlayer ? '#4a6a2a' : '#6a2a2a'} />
      <rect x={8*s} y={-12*s} width={6*s} height={24*s} fill={isPlayer ? '#4a6a2a' : '#6a2a2a'} />
      {/* Track segments */}
      {[-8,-4,0,4,8].map(oy => (
        <React.Fragment key={oy}>
          <rect x={-14*s} y={oy*s} width={6*s} height={2*s} fill={isPlayer ? '#3a5a1a' : '#5a1a1a'} />
          <rect x={8*s} y={oy*s} width={6*s} height={2*s} fill={isPlayer ? '#3a5a1a' : '#5a1a1a'} />
        </React.Fragment>
      ))}
      {/* Hull */}
      <rect x={-8*s} y={-10*s} width={16*s} height={20*s} fill={color} />
      {/* Hull detail */}
      <rect x={-6*s} y={-8*s} width={12*s} height={16*s} fill={isPlayer ? '#5a8a3a' : '#8a3a3a'} />
      {/* Turret base */}
      <rect x={-6*s} y={-6*s} width={12*s} height={10*s} fill={isPlayer ? '#4a7a2a' : '#7a2a2a'} />
      {/* Turret */}
      <rect x={-4*s} y={-8*s} width={8*s} height={8*s} fill={isPlayer ? '#3a6a1a' : '#6a1a1a'} />
      {/* Cannon */}
      <rect x={-2*s} y={-16*s} width={4*s} height={12*s} fill={isPlayer ? '#2a5a0a' : '#5a0a0a'} />
      {/* Eye/sight */}
      <rect x={-2*s} y={-6*s} width={4*s} height={4*s} fill={isPlayer ? '#a0e050' : '#e05050'} />
      {/* Star on player tank */}
      {isPlayer && (
        <rect x={-2*s} y={2*s} width={4*s} height={4*s} fill="#f5c842" />
      )}
    </g>
  );
};

export default PixelTank;
