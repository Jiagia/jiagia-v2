import {useState} from 'react';
import {Image} from '@shopify/hydrogen';

interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productTitle: string;
}

export function ProductImageGallery({images, productTitle}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
          No images available
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <div className="w-full">
      {/* Desktop Layout: Thumbnails on left, Main image on right */}
      <div className="hidden md:flex gap-4">
        {/* Thumbnail Gallery - Left Side */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 w-20">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-md bg-gray-100 border-2 transition-all duration-200 hover:border-gray-400 ${
                  index === selectedImageIndex 
                    ? 'border-black ring-1 ring-black ring-offset-1' 
                    : 'border-gray-200'
                }`}
              >
                <Image
                  alt={image.altText || `${productTitle} - Thumbnail ${index + 1}`}
                  aspectRatio="1/1"
                  data={image}
                  sizes="80px"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay for non-selected thumbnails */}
                {index !== selectedImageIndex && (
                  <div className="absolute inset-0 bg-white/20 hover:bg-white/10 transition-colors duration-200" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Image - Right Side */}
        <div className="flex-1 relative">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              alt={selectedImage.altText || `${productTitle} - Image ${selectedImageIndex + 1}`}
              aspectRatio="1/1"
              data={selectedImage}
              key={selectedImage.id}
              sizes="(min-width: 1024px) 60vw, (min-width: 45em) 50vw, 100vw"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout: Main image on top, thumbnails below */}
      <div className="md:hidden space-y-4">
        {/* Main Image */}
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              alt={selectedImage.altText || `${productTitle} - Image ${selectedImageIndex + 1}`}
              aspectRatio="1/1"
              data={selectedImage}
              key={selectedImage.id}
              sizes="100vw"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery - Mobile */}
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-md bg-gray-100 border-2 transition-all duration-200 hover:border-gray-400 ${
                  index === selectedImageIndex 
                    ? 'border-black ring-1 ring-black ring-offset-1' 
                    : 'border-gray-200'
                }`}
              >
                <Image
                  alt={image.altText || `${productTitle} - Thumbnail ${index + 1}`}
                  aspectRatio="1/1"
                  data={image}
                  sizes="20vw"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay for non-selected thumbnails */}
                {index !== selectedImageIndex && (
                  <div className="absolute inset-0 bg-white/20 hover:bg-white/10 transition-colors duration-200" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Navigation Arrows for Mobile */}
        {images.length > 1 && (
          <div className="flex justify-between items-center">
            <button
              onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-sm text-gray-600 font-medium">
              {selectedImageIndex + 1} of {images.length}
            </span>
            
            <button
              onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              aria-label="Next image"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
