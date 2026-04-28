import React from 'react';
import htmlContent from './privacy.html?raw';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div 
        style={{ fontSize: '12px', color: '#666666', lineHeight: '26px' }}
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
}
