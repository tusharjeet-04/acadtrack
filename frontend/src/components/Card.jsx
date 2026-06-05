import React from 'react';

const Card = ({ children, title, subtitle, className = '', headerAction }) => {
  return (
    <div className={`glass-panel p-6 ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4 border-b border-darkBorder/40 pb-3">
          <div>
            <h3 className="font-semibold text-lg text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
