import React from 'react';
import { Wrench, Cog, Cpu, Box, Code, Zap } from 'lucide-react';

const PartIcon = ({ type, size = 56 }) => {
  let color = "#22d3ee"; // default cyan
  let Icon = Wrench;

  switch (type) {
    case 'mechanical':
      color = "#fb923c"; // orange
      Icon = Cog;
      break;
    case 'electronic':
      color = "#34d399"; // emerald
      Icon = Cpu;
      break;
    case 'aesthetic':
      color = "#f472b6"; // pink
      Icon = Box;
      break;
    case 'code':
      color = "#60a5fa"; // blue
      Icon = Code;
      break;
    default:
      color = "#22d3ee";
      Icon = Zap;
  }

  return <Icon size={size} color={color} style={{ filter: `drop-shadow(0 0 8px ${color}99)` }} />;
};

export default PartIcon;