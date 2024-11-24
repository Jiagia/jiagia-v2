import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Image} from '@shopify/hydrogen';
import {Await, useLoaderData, NavLink, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `${data?.criticalData.page?.seo.title}`},
    {description: `${data?.criticalData.page?.seo.description}`},
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, criticalData});
}

async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const handle = 'about';

  const [{page}] = await Promise.all([
    storefront.query(PAGE_QUERY, {
      cache: storefront.CacheLong(),
      variables: {handle},
    }),
  ]);

  if (!page) {
    console.error(page);
    throw new Response(null, {status: 404});
  }

  return {
    page,
  };
}

function loadDeferredData({context}: LoaderFunctionArgs) {
  const image1 = context.storefront
    .query(ABOUT_IMAGE_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  
  return {
    image1,

  };
}

export default function About() {
  const data = useLoaderData<typeof loader>();
  const page = data.criticalData.page

  // generate stars
  let stars: number[] = new Array(100);
  for (let i=0; i<stars.length; i++) stars[i] = Math.random()*200;

  return (
    <Suspense>
      <Await resolve={data.image1}>
        {(response) => (
          <div className="bg-no-repeat dark:text-white mb-[160px] overflow-hidden" 
          style={{backgroundImage: `url(${response.image?.image.reference?.image.url || ""})`,
          backgroundSize: "cover" }}
          >
            {stars.map((star, i) => (
              <div key={i} 
              style={{position: "absolute", 
                      top: star+"%", 
                      left: Math.random()*100+"%", 
                      fontSize: "10px",
                      zIndex: -1,
                    }}
                >
                &#10022;
              </div>
            ))}
            <h1 className="pt-[240px] text-center text-[36px] dark:bg-black">ABOUT US</h1>
            <div className="mt-4 w-5/6 sm:w-1/3 mx-auto dark:bg-black" dangerouslySetInnerHTML={{__html: page.body}} />
            <div className="pt-[100px]  flex justify-center">
              <NavLink
                to="/dreamscapes"
                className="p-2 hover:font-bold border hover:border-2 border-black dark:border-white hover:no-underline dark:bg-black"
              >
                {/* &gt; VIEW DREAMSCAPES &lt; */}
                &gt; BACK TO HOME &lt;
              </NavLink>
            </div>
            <Image className="mx-auto mt-12 sm:invisible" data={response.char?.image.reference.image} sizes="" width="50%" />
          </div>
        )}
      </Await>
    </Suspense>
      
    
  );
}

const PAGE_QUERY = `#graphql
  query About($handle: String!) {
    page(handle: $handle) {
      handle
      body
      seo {
        title
        description
      }
    }
  }
` as const;

const ABOUT_IMAGE_QUERY = `#graphql
  query AboutImage {
    image: metaobject(handle: {handle: "about1", type: "image"}) {
      id
      handle
      type
      image: field(key: "image") {
        reference {
          ... on MediaImage {
            alt
            image {
              altText
              height
              id
              url
              width
            }
          }
        }
      }
      size: field(key: "size") {
        value
        type
      }
    }
    char: metaobject(handle: {handle: "about2", type: "image"}) {
      id
      handle
      type
      image: field(key: "image") {
        reference {
          ... on MediaImage {
            alt
            image {
              altText
              height
              id
              url
              width
            }
          }
        }
      }
      size: field(key: "size") {
        value
        type
      }
    }
  }
` as const;
