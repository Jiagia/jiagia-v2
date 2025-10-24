import {useState, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';

interface ExhibitionEntry {
  id: string;
  image: {
    reference: {
      image: {
        id: string;
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
  title?: {
    value?: string;
  };
  material?: {
    value?: string;
  };
  description?: {
    value?: string;
  };
  category?: {
    value?: string;
  };
  exhibitionHandle?: {
    value?: string;
  };
  richDescription?: {
    references?: {
      nodes?: Array<{
        id?: string;
        text?: {
          value?: string;
        };
      }>;
    };
  };
}

interface ExhibitionRowGalleryProps {
  entries: ExhibitionEntry[];
  rowTitle?: string;
}

export function ExhibitionRowGallery({entries, rowTitle}: ExhibitionRowGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (entries.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : entries.length - 1);
        setImageLoaded(true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedIndex(prev => prev < entries.length - 1 ? prev + 1 : 0);
        setImageLoaded(true);
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
        setIsZoomed(false);
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [entries.length, isLightboxOpen]);

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
      setSelectedIndex(prev => prev < entries.length - 1 ? prev + 1 : 0);
      setImageLoaded(true);
    }
    if (isRightSwipe) {
      setSelectedIndex(prev => prev > 0 ? prev - 1 : entries.length - 1);
      setImageLoaded(true);
    }
  };

  const handleImageChange = (index: number) => {
    setImageLoaded(true);
    setSelectedIndex(index);
  };

  if (!entries || entries.length === 0) {
    return null;
  }

  const selectedEntry = entries[selectedIndex];
  const selectedImage = selectedEntry?.image?.reference?.image;
  const selectedTitle = selectedEntry?.title?.value;
  const selectedMaterial = selectedEntry?.material?.value;
  const exhibitionHandle = selectedEntry?.exhibitionHandle?.value;
  
  // Use richDescription if category is "exhibition", otherwise use regular description
  const isExhibitionCategory = selectedEntry?.category?.value === 'exhibition';
  const richDescriptionNodes = selectedEntry?.richDescription?.references?.nodes || [];
  
  // Parse rich text JSON and convert to React elements with formatting
  const richDescriptionElements = richDescriptionNodes
    .map((node) => {
      const textValue = node?.text?.value;
      const nodeId = node?.id || Math.random().toString();
      if (!textValue) return null;
      
      try {
        // Parse the JSON structure
        const parsed = JSON.parse(textValue);
        
        // Convert rich text to React elements with formatting
        const renderRichText = (obj: any, key: string = ''): any => {
          if (typeof obj === 'string') return obj;
          
          if (obj?.type === 'text' && obj?.value) {
            const text = obj.value;
            
            // Apply formatting based on properties
            if (obj.bold && obj.italic) {
              return <strong key={key}><em>{text}</em></strong>;
            } else if (obj.bold) {
              return <strong key={key}>{text}</strong>;
            } else if (obj.italic) {
              return <em key={key}>{text}</em>;
            }
            
            return text;
          }
          
          if (obj?.children) {
            return obj.children.map((child: any, idx: number) => 
              renderRichText(child, `${key}-${idx}`)
            );
          }
          
          return null;
        };
        
        return {
          id: nodeId,
          content: (
            <span key={nodeId}>
              {renderRichText(parsed, `node-${nodeId}`)}
            </span>
          ),
        };
      } catch {
        // If parsing fails, return the raw value
        return {
          id: nodeId,
          content: textValue,
        };
      }
    })
    .filter(Boolean);
  
  const selectedDescription = selectedEntry?.description?.value;

  return (
    <>
      <div className="w-full">
        {/* Desktop Layout */}
        <div className="hidden md:flex gap-6">
          {/* Thumbnail Gallery - Left Side */}
          {entries.length > 1 && (
            <div className="flex flex-col gap-3 w-24">
              {entries.map((entry, index) => {
                const image = entry?.image?.reference?.image;
                if (!image) return null;
                
                return (
                  <button
                    key={entry.id}
                    onClick={() => handleImageChange(index)}
                    className={`group relative aspect-square overflow-hidden rounded transition-all duration-300 ${
                      index === selectedIndex 
                        ? 'ring-2 ring-white shadow-lg scale-105' 
                        : 'ring-1 ring-white/30 hover:ring-white/60 hover:scale-102'
                    }`}
                  >
                    <Image
                      alt={image.altText || `${rowTitle} - Thumbnail ${index + 1}`}
                      // aspectRatio="1/1"
                      data={image}
                      sizes="96px"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay for non-selected thumbnails */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      index === selectedIndex 
                        ? 'opacity-0' 
                        : 'opacity-30 group-hover:opacity-10 bg-black'
                    }`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Image - Right Side */}
          <div className="flex-1 relative group">
            {isExhibitionCategory && exhibitionHandle ? (
              <Link
                to={`/exhibitions/${exhibitionHandle}`}
                className="block w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black cursor-pointer relative"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                aria-label={`View ${selectedTitle || 'exhibition'}`}
              >
                {/* Loading skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
                )}
                
                {selectedImage && (
                  <Image
                    alt={selectedImage.altText || `${rowTitle} - Image ${selectedIndex + 1}`}
                    data={selectedImage}
                    key={selectedImage.id}
                    sizes="(min-width: 1024px) 60vw, (min-width: 45em) 50vw, 100vw"
                    className={`w-full h-auto transition-all duration-500 ${
                      isZoomed ? 'scale-110' : 'scale-100'
                    } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                )}

                {/* Link icon hint */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </Link>
            ) : (
              <button 
                className="w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black cursor-zoom-in relative"
                onClick={() => setIsLightboxOpen(true)}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                aria-label="View full-screen image"
              >
                {/* Loading skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
                )}
                
                {selectedImage && (
                  <Image
                    alt={selectedImage.altText || `${rowTitle} - Image ${selectedIndex + 1}`}
                    data={selectedImage}
                    key={selectedImage.id}
                    sizes="(min-width: 1024px) 60vw, (min-width: 45em) 50vw, 100vw"
                    className={`w-full h-auto transition-all duration-500 ${
                      isZoomed ? 'scale-110' : 'scale-100'
                    } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                )}

                {/* Expand icon hint */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
              </button>
            )}
            
            {/* Image counter */}
            {entries.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-sm">
                {selectedIndex + 1} / {entries.length}
              </div>
            )}

            {/* Navigation arrows for desktop */}
            {entries.length > 1 && (
              <>
                <button
                  onClick={() => handleImageChange(selectedIndex > 0 ? selectedIndex - 1 : entries.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => handleImageChange(selectedIndex < entries.length - 1 ? selectedIndex + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* Main Image with swipe support */}
          <div 
            className="relative"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {isExhibitionCategory && exhibitionHandle ? (
              <Link
                to={`/exhibitions/${exhibitionHandle}`}
                className="block w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black relative"
                aria-label={`View ${selectedTitle || 'exhibition'}`}
              >
                {/* Loading skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
                )}
                
                {selectedImage && (
                  <Image
                    alt={selectedImage.altText || `${rowTitle} - Image ${selectedIndex + 1}`}
                    data={selectedImage}
                    key={selectedImage.id}
                    sizes="100vw"
                    className={`w-full h-auto transition-opacity duration-500 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />
                )}

                {/* Tap to link hint */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </Link>
            ) : (
              <button 
                className="w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black relative"
                onClick={() => setIsLightboxOpen(true)}
                aria-label="View full-screen image"
              >
                {/* Loading skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
                )}
                
                {selectedImage && (
                  <Image
                    alt={selectedImage.altText || `${rowTitle} - Image ${selectedIndex + 1}`}
                    data={selectedImage}
                    key={selectedImage.id}
                    sizes="100vw"
                    className={`w-full h-auto transition-opacity duration-500 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />
                )}

                {/* Tap to expand hint */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
              </button>
            )}
            
            {/* Image counter */}
            {entries.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-sm">
                {selectedIndex + 1} / {entries.length}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery - Mobile */}
          {entries.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {entries.map((entry, index) => {
                const image = entry?.image?.reference?.image;
                if (!image) return null;
                
                return (
                  <button
                    key={entry.id}
                    onClick={() => handleImageChange(index)}
                    className={`flex-shrink-0 relative w-16 h-16 overflow-hidden rounded transition-all duration-300 ${
                      index === selectedIndex 
                        ? 'ring-2 ring-white scale-105' 
                        : 'ring-1 ring-white/30'
                    }`}
                  >
                    <Image
                      alt={image.altText || `${rowTitle} - Thumbnail ${index + 1}`}
                      //  aspectRatio="1/1"
                      data={image}
                      sizes="64px"
                      className="w-full h-full object-cover"
                    />
                    
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      index === selectedIndex ? 'opacity-0' : 'opacity-30 bg-black'
                    }`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Description below the image */}
        {(isExhibitionCategory ? richDescriptionElements.length > 0 : selectedDescription) && (
          <div className="mt-6 text-center">
            {/* Title and Material - only show for exhibition category */}
            {isExhibitionCategory && (selectedTitle || selectedMaterial) && (
              <div className="mb-6 space-y-2">
                {selectedTitle && (
                  <h3 className="text-lg md:text-xl font-semibold text-white">
                    {selectedTitle}
                  </h3>
                )}
                {selectedMaterial && (
                  <p className="text-sm md:text-base text-white/70 italic">
                    {selectedMaterial}
                  </p>
                )}
              </div>
            )}
            
            {/* Description text */}
            <div className="text-sm md:text-base leading-relaxed text-white/90 space-y-4">
              {isExhibitionCategory ? (
                richDescriptionElements.map((element) => (
                  <p key={element.id}>{element.content}</p>
                ))
              ) : (
                <p className="whitespace-pre-wrap">{selectedDescription}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
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
              alt={selectedImage.altText || `${rowTitle} - Image ${selectedIndex + 1}`}
              data={selectedImage}
              sizes="90vw"
              className="max-h-[90vh] w-auto object-contain"
            />
          </div>

          {/* Lightbox navigation */}
          {entries.length > 1 && (
            <>
              <button
                onClick={() => handleImageChange(selectedIndex > 0 ? selectedIndex - 1 : entries.length - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
                aria-label="Previous image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => handleImageChange(selectedIndex < entries.length - 1 ? selectedIndex + 1 : 0)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
                aria-label="Next image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Lightbox counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium tracking-wide z-20">
                {selectedIndex + 1} / {entries.length}
              </div>
            </>
          )}

          {/* Description in lightbox */}
          {(isExhibitionCategory ? richDescriptionElements.length > 0 : selectedDescription) && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4 z-20">
              <div className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg text-sm md:text-base text-center space-y-3">
                {/* Title and Material in lightbox - only show for exhibition category */}
                {isExhibitionCategory && (selectedTitle || selectedMaterial) && (
                  <div className="mb-4 space-y-2 border-b border-white/20 pb-3">
                    {selectedTitle && (
                      <h3 className="text-base md:text-lg font-semibold text-white">
                        {selectedTitle}
                      </h3>
                    )}
                    {selectedMaterial && (
                      <p className="text-xs md:text-sm text-white/70 italic">
                        {selectedMaterial}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Description text */}
                {isExhibitionCategory ? (
                  richDescriptionElements.map((element) => (
                    <p key={element.id}>{element.content}</p>
                  ))
                ) : (
                  <p>{selectedDescription}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

