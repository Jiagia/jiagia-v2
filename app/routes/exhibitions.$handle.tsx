import {Image} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';

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
    cache: context.storefront.CacheLong(),
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
        backgroundColor: `#${exhibition.backgroundColor?.value}` || '#000',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-32 xl:px-48">
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

          {/* Exhibition Entries */}
          {entries && entries.length > 0 && (
            <div className="grid grid-cols-1 gap-8 md:gap-12 lg:gap-20">
              {entries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-4 md:gap-6 lg:gap-8 text-center"
                >
                  <div className="w-full">
                    {/* <h3 className="text-lg md:text-3xl font-semibold mb-4 md:mb-6 lg:mb-8">
                      {entry.title.value}
                    </h3> */}
                    <Image
                      data={entry?.image?.reference?.image}
                      className="w-full h-auto"
                      aspectRatio="4/3"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const EXHIBITION_QUERY = `#graphql
  fragment Entry on Metaobject {
    id
    handle
    title: field(key: "title") {
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
              ...Entry
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

