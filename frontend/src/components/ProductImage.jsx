import React, { useState } from 'react';
import { Package } from 'lucide-react';

const ProductImage = ({ src, alt, style, className }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div 
        className={className} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#f8fafc', 
          color: '#cbd5e1',
          width: '100%',
          height: '100%',
          ...style 
        }}
      >
        <Package size={48} />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      style={style} 
      className={className}
      onError={() => setHasError(true)} 
    />
  );
};

export default ProductImage;
