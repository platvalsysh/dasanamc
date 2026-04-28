import React from 'react';
import htmlContent from './rules.html?raw';

export default function Rules() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">이용약관</h1>
      <div 
        style={{ fontSize: '12px', color: '#666666', lineHeight: '26px' }}
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
}
