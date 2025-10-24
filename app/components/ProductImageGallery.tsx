import {useState, useEffect} from 'react';
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
        setImageLoaded(true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
        setImageLoaded(true);
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, isLightboxOpen]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Handle touch events for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
      setImageLoaded(true);
    }
    if (isRightSwipe) {
      setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
      setImageLoaded(true);
    }
  };

  const handleImageChange = (index: number) => {
    setImageLoaded(true);
    setSelectedImageIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full">
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          No images available
        </div>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <>
      <div className="w-full">
        {/* Desktop Layout: Elegant side-by-side with refined thumbnails */}
        <div className="hidden md:flex gap-6">
          {/* Thumbnail Gallery - Left Side */}
          {images.length > 1 && (
            <div className="flex flex-col gap-3 w-24">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleImageChange(index)}
                  className={`group relative aspect-square overflow-hidden rounded transition-all duration-300 ${
                    index === selectedImageIndex 
                      ? 'ring-2 ring-black shadow-lg scale-105' 
                      : 'ring-1 ring-gray-200 hover:ring-gray-400 hover:scale-102'
                  }`}
                >
                  <Image
                    alt={image.altText || `${productTitle} - Thumbnail ${index + 1}`}
                    aspectRatio="1/1"
                    data={image}
                    sizes="96px"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Elegant overlay for non-selected thumbnails */}
                  <div className={`absolute inset-0 transition-opacity duration-300 ${
                    index === selectedImageIndex 
                      ? 'opacity-0' 
                      : 'opacity-30 group-hover:opacity-10 bg-white'
                  }`} />
                </button>
              ))}
            </div>
          )}

          {/* Main Image - Right Side */}
          <div className="flex-1 relative group">
            <button 
              className="w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 cursor-zoom-in relative"
              onClick={() => setIsLightboxOpen(true)}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              aria-label="View full-screen image"
            >
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              )}
              
              <Image
                alt={selectedImage.altText || `${productTitle} - Image ${selectedImageIndex + 1}`}
                data={selectedImage}
                key={selectedImage.id}
                sizes="(min-width: 1024px) 60vw, (min-width: 45em) 50vw, 100vw"
                className={`w-full h-auto transition-all duration-500 ${
                  isZoomed ? 'scale-110' : 'scale-100'
                } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Expand icon hint */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
            </button>
            
            {/* Refined image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Navigation arrows for desktop */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => handleImageChange(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-300 hover:scale-110"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => handleImageChange(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all duration-300 hover:scale-110"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Layout: Refined touch-friendly interface */}
        <div className="md:hidden space-y-4">
          {/* Main Image with swipe support */}
          <div 
            className="relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button 
              className="w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 relative"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="View full-screen image"
            >
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              )}
              
              <Image
                alt={selectedImage.altText || `${productTitle} - Image ${selectedImageIndex + 1}`}
                data={selectedImage}
                key={selectedImage.id}
                sizes="100vw"
                className={`w-full h-auto transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Tap to expand hint */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
            </button>
            
            {/* Refined image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Refined Thumbnail Gallery - Mobile */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleImageChange(index)}
                  className={`flex-shrink-0 relative w-16 h-16 overflow-hidden rounded transition-all duration-300 ${
                    index === selectedImageIndex 
                      ? 'ring-2 ring-black scale-105' 
                      : 'ring-1 ring-gray-200'
                  }`}
                >
                  <Image
                    alt={image.altText || `${productTitle} - Thumbnail ${index + 1}`}
                    aspectRatio="1/1"
                    data={image}
                    sizes="64px"
                    className="w-full h-full object-cover"
                  />
                  
                  <div className={`absolute inset-0 transition-opacity duration-300 ${
                    index === selectedImageIndex ? 'opacity-0' : 'opacity-30 bg-white'
                  }`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Backdrop overlay (click to close) */}
          <div 
            className="absolute inset-0 z-0"
            onClick={() => {
              setIsLightboxOpen(false);
              setIsZoomed(false);
            }}
            aria-hidden="true"
          />

          {/* Close button */}
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
            onClick={() => {
              setIsLightboxOpen(false);
              setIsZoomed(false);
            }}
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main lightbox image */}
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center pointer-events-none z-10">
            <Image
              alt={selectedImage.altText || `${productTitle} - Image ${selectedImageIndex + 1}`}
              data={selectedImage}
              sizes="90vw"
              className="max-h-[90vh] w-auto object-contain"
            />
          </div>

          {/* Lightbox navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => handleImageChange(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
                aria-label="Previous image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => handleImageChange(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
                aria-label="Next image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Lightbox counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium tracking-wide z-20">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
