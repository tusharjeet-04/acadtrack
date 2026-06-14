import React from 'react';

const Card = ({ children, title, subtitle, className = '', headerAction }) => {
  return (
    <div className={`glass-panel p-6 ${className}`}>
      {title && (
        <div className="section-header">
          <div>
            <h3 className="section-title">{title}</h3>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
