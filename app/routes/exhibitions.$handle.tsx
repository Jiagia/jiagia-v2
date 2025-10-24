import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
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
  const entries = exhibition?.entries?.references?.nodes;

  return (
    <div
      className="min-h-screen py-12 md:py-20 lg:py-32"
      style={{
        backgroundColor: `${exhibition.backgroundColor?.value}` || '#000',
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

            {/* Exhibition Description */}
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {exhibition.description.value}
              </p>
            </div>
          </div>

          {/* Exhibition Entries - Each Row */}
          {entries && entries.length > 0 && (
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
      references(first: 10) {
        nodes {
          ... on Metaobject {
            ...Description
          }
        }
      }
    }
  }
  fragment Row on Metaobject {
    id
    handle
    title: field(key: "title") {
      value
    }
    entries: field(key: "entries") {
      references(first: 10) {
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
        references(first: 10) {
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
    }
  }
` as const;

