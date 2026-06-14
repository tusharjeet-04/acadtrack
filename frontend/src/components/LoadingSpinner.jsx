import React from 'react';

const LoadingSpinner = ({ size = 'medium', label = 'Loading…' }) => {
  const outer = { small: 'h-8 w-8',  medium: 'h-12 w-12', large: 'h-16 w-16' }[size];
  const inner = { small: 'h-5 w-5',  medium: 'h-8 w-8',   large: 'h-11 w-11' }[size];
  const ring  = { small: 'border-2', medium: 'border-2',   large: 'border-[3px]' }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${outer} relative flex items-center justify-center`}>
        {/* outer ring */}
        <div className={`absolute inset-0 rounded-full ${ring} border-primary-800/30`} />
        {/* spinning arc */}
        <div className={`${outer} animate-spin rounded-full ${ring} border-transparent border-t-primary-500`} />
        {/* center dot */}
        <div className={`${inner} rounded-full bg-primary-600/10 border ${ring} border-primary-700/20`} />
      </div>
      {size === 'large' && (
        <p className="text-xs text-slate-600 animate-pulse">{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
