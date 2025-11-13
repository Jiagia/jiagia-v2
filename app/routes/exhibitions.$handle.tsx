import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ExhibitionRowGallery} from '~/components/ExhibitionRowGallery';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  const title = data?.exhibition?.title?.value || 'Exhibition';
  const description = data?.exhibition?.description?.value || '';
  
  return [
    {title: `${title} | Jiagia Studios`},
    {name: 'description', content: description},
  ];
};

export async function loader({params, context}: LoaderFunctionArgs) {
  const {handle} = params;
  
  if (!handle) {
    throw new Response('Exhibition handle is required', {status: 400});
  }

  const exhibition = await context.storefront.query(EXHIBITION_QUERY, {
    // cache: context.storefront.CacheLong(),
    variables: {
      handle,
      type: 'exhibition',
    },
  });

  if (!exhibition?.exhibition) {
    throw new Response('Exhibition not found', {status: 404});
  }

  return {exhibition: exhibition.exhibition};
}

export default function Exhibition() {
  const {exhibition} = useLoaderData<typeof loader>();
  console.log(JSON.stringify(exhibition, null, 2));
  const entries = exhibition?.entries?.references?.nodes || null;
  const material = exhibition?.material?.value || null;
  const isPainting = exhibition?.isPainting?.value === 'true';
  const poster = exhibition?.poster?.reference?.image || null;
  const quoteRaw = exhibition?.quote?.value || null;
  const richDescriptionNodes = exhibition?.richDescription?.references?.nodes || [];

  // Parse rich text quote
  let quoteText = '';
  if (quoteRaw) {
    try {
      const parsed = JSON.parse(quoteRaw);
      
      const extractText = (obj: any): string => {
        if (typeof obj === 'string') return obj;
        if (obj?.value) return obj.value;
        if (obj?.children) {
          return obj.children
            .map((child: any) => extractText(child))
            .join('');
        }
        return '';
      };
      
      quoteText = extractText(parsed);
    } catch {
      quoteText = quoteRaw;
    }
  }

  // Parse rich description (same logic as ExhibitionRowGallery)
  const richDescriptionElements = richDescriptionNodes
    .map((node: any) => {
      const textValue = node?.text?.value;
      const nodeId = node?.id || Math.random().toString();
      if (!textValue) return null;
      
      try {
        const parsed = JSON.parse(textValue);
        
        const renderRichText = (obj: any, key: string = ''): any => {
          if (typeof obj === 'string') return obj;
          
          if (obj?.type === 'text' && obj?.value) {
            const text = obj.value;
            
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
        return {
          id: nodeId,
          content: textValue,
        };
      }
    })
    .filter(Boolean);

  return (
    <div
      className="min-h-screen py-12 md:py-20 lg:py-32 -mt-8 md:-mt-12 lg:-mt-16"
      style={{
        backgroundColor: exhibition?.backgroundColor?.value || '#000',
      }}
    >
      <div className="container text-white mx-auto px-4 sm:px-6 lg:px-32 xl:px-48">
        <div className="max-w-7xl mx-auto">
          {/* Exhibition Header */}
          <div className="mb-12 md:mb-20 lg:mb-32 py-8 md:py-12 lg:py-16">
            {/* Exhibition Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 md:mb-8">
              {exhibition.title.value}
            </h1>

            {/* Exhibition Material */}
            {material && (
              <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8">
                <p className="text-sm md:text-base text-white/70 italic">
                  {material}
                </p>
              </div>
            )}

            {/* Exhibition Quote */}
            {quoteText && (
              <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8">
                <p className="text-sm md:text-base text-white/80">
                  {quoteText}
                </p>
              </div>
            )}

            {/* Exhibition Poster - only show if isPainting is true */}
            {isPainting && poster && (
              <div className="max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16">
                <Image
                  data={poster}
                  alt={poster.altText || exhibition.title.value}
                  className="w-full h-auto rounded-lg"
                  sizes="(min-width: 1024px) 896px, (min-width: 768px) 768px, 100vw"
                />
              </div>
            )}

            {/* Rich Description - only show if isPainting is true */}
            {isPainting && richDescriptionElements.length > 0 && (
              <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
                <div className="text-base md:text-lg leading-relaxed text-white/90 space-y-4">
                  {richDescriptionElements.map((element: any) => (
                    <p key={element.id}>{element.content}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Exhibition Description - only show if NOT isPainting */}
            {!isPainting && exhibition?.description?.value && (
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                  {exhibition.description.value}
                </p>
              </div>
            )}
          </div>

          {/* Exhibition Entries - Each Row */}
          {entries && Array.isArray(entries) && entries.length > 0 && (
            <div className="grid grid-cols-1 gap-16 md:gap-20 lg:gap-32">
              {entries.map((row: any) => {
                // Get entries from the row
                const rowEntries = row?.entries?.references?.nodes || [];
                
                // Get row title if available
                const rowTitle = row?.title?.value || 'Exhibition Row';
                
                return rowEntries.length > 0 ? (
                  <div key={row.id} className="w-full">
                    <ExhibitionRowGallery 
                      entries={rowEntries}
                      rowTitle={rowTitle}
                    />
                  </div>
                ) : null;
              })}
            </div>
          )}

          {/* Special Thanks Section */}
          <div className="mt-24 md:mt-32 lg:mt-40 py-12 md:py-16 lg:py-20 border-t border-white/20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8 md:mb-12">
                Special Thanks
              </h2>
              
              <div className="space-y-6 md:space-y-8 text-base md:text-lg leading-relaxed text-white/90">
                <p>
                  To start, we would like give a special thank our sound design partner Leon who has helped us bring the sounds from the Daydream Universe alive. You have opened our eyes to the limitless possibilities and power that audio can have on us.
                </p>
                
                <p>
                  We would also like specially thank Isaiah Trevino for helping bring our Daydream Universe concepts into a tangible environment.
                </p>
                
                <p>
                  Finally, as a team, we want to thank YOU, dear viewer. Your passion is what inspires us and continuously fuels this project. Our goal is to create a space where we can all explore the infinite universes that exist within us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const EXHIBITION_QUERY = `#graphql
  fragment Description on Metaobject {
    id
    handle
    text: field(key: "text") {
      value
    }
  }
  fragment Entry on Metaobject {
    id
    handle
    title: field(key: "title") {
      value
    }
    category: field(key: "category") {
      value
    }
    material: field(key: "material") {
      value
    }
    description: field(key: "description") {
      value
    }
    image: field(key: "image") {
      reference {
        ... on MediaImage {
          alt
          image {
            altText
            height
            width
            url
          }
        }
      }
    }
    richDescription: field(key: "rich_description") {
      references(first: 20) {
        nodes {
          ... on Metaobject {
            ...Description
          }
        }
      }
    }
    exhibitionHandle: field(key: "exhibition_handle") {
      value
    }
    sound: field(key: "sound") {
      value
    }
    buttonText: field(key: "button_text") {
      value
    }
    buttonLink: field(key: "button_link") {
      value
    }
  }
  fragment Row on Metaobject {
    id
    handle
    title: field(key: "title") {
      value
    }
    entries: field(key: "entries") {
      references(first: 20) {
        nodes {
          ... on Metaobject {
            ...Entry
          }
        }
      }
    }
  }
  query Exhibition($handle: String!, $type: String!) {
    exhibition: metaobject(handle: {handle: $handle, type: $type}) {
      id
      handle
      title: field(key: "title") {
        value
      }
      description: field(key: "description") {
        value
      }
      poster: field(key: "poster") {
        reference {
          ... on MediaImage {
            alt
            image {
              altText
              height
              width
              url
            }
          }
        }
      }
      entries: field(key: "entries") {
        references(first: 20) {
          nodes {
            ... on Metaobject {
              ...Row
            }
          }
        }
      }
      backgroundColor: field(key: "background_color") {
        value
      }
      material: field(key: "material") {
        value
      }
      isPainting: field(key: "is_painting") {
        value
      }
      quote: field(key: "quote") {
        value
      }
      richDescription: field(key: "rich_description") {
        references(first: 20) {
          nodes {
            ... on Metaobject {
              ...Description
            }
          }
        }
      }
    }
  }
` as const;

