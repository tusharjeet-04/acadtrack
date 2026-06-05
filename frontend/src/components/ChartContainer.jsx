import React from 'react';
import Card from './Card';

const ChartContainer = ({ children, title, subtitle, className = '' }) => {
  return (
    <Card title={title} subtitle={subtitle} className={className}>
      <div className="w-full h-80 relative">
        {children}
      </div>
    </Card>
  );
};

export default ChartContainer;
