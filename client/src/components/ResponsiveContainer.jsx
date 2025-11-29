// client/src/components/ResponsiveContainer.jsx
import React from 'react';

const ResponsiveContainer = ({ 
  children, 
  className = '', 
  maxWidth = 'max-w-7xl',
  padding = 'p-4 md:p-6 lg:p-8' 
}) => {
  return (
    <div className={`${maxWidth} mx-auto ${padding} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;