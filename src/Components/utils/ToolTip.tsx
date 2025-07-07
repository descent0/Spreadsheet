// TooltipWrapper.tsx
import React from 'react';

interface TooltipWrapperProps {
  tooltip: string;
  children: React.ReactNode;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ tooltip, children }) => {
  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {tooltip}
      </div>
    </div>
  );
};

export default TooltipWrapper;
