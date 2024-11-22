import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
  TowerQuery,
  CloudsQuery,
} from 'storefrontapi.generated';


import  lumaperl from  "~/assets/LumaPerl.png"

export const meta: MetaFunction = () => {
  return [{title: 'Jiagia Studios'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {

  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  // const handle = "home-page";
  // const type = "tower";
  // const [{tower = await Promise.all([
  //   context.storefront
  //   .query(TOWER_QUERY, {
  //     variables: {handle, type},
  //   }),
  // ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  
  const handle = "home-page";
  const type = "tower";
  const tower = context.storefront
    .query(TOWER_QUERY, {
      variables: {handle, type},
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

    const clouds = context.storefront
    .query(CLOUD_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
    tower,
    clouds
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="home dark">
      <div className="dark:bg-black dark:text-white">
       <Planets></Planets>
      
      <div className="relative">
       <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={data.tower}>
          {(response) => (
            <div className="relative md:min-h-[120wh]">
            {response ? (
              <>
                <Tower tower={response} />
              </>) : null
            }
            </div>
          )}
        </Await>
        </Suspense>

        <Clouds clouds={data.clouds} />
        </div>
       {/* <Tower tower={data.tower}></Tower> */}
      </div>
    </div>
  );
}



function Planets() {
  return (
    <div className="pt-40">
      <div className="min-h-32"></div>
      <div className="max-w-[400px] mx-auto text-center">
        <p>WE ARE A CREATIVE LABORATORY EXPLORING WORLDS WITHIN THE <i><strong>“DAYDREAM UNIVERSE”</strong></i> </p>
        
        <p className="mt-[2rem]">FROM THESE JOURNEYS, WE GATHER ARTIFACTS AND CREATE ART INSPIRED BY OUR FINDINGS </p>

        <div className="flex justify-center items-center">
          <img className="mt-40" src={lumaperl} />
        </div>

        <h5 className=" my-4 text-[64px] text-[#896997]">LUMAPERL</h5>

        <Link to="/dreamscape/lumaperl">
          <h4 className="border border-white border-2 text-[32px]"> &lt; VIEW LATEST EDITION &gt; </h4>
        </Link>

        <div className="min-h-32"></div>
        
      </div>
      
      
    </div>
  )
}


function Tower({
  tower,
}: {
  tower: TowerQuery;
}) {
  if (!tower.home) return null;

  // buggy/ - need to refresh every hour
  const colors = JSON.parse(tower.home.color.value);
  const time = JSON.parse(tower.home.time.value);

  let currentTime = new Date();
  let hr = currentTime.getHours();
  let i = 0
  for (i = 0; i++; i < time.length) {
    if (hr > time[i]) break;
  }
  let sky_color = colors[i].toString();

  return (
    <>
      <div className={" h-[320px] w-full"} style={{backgroundImage: "linear-gradient(to bottom, black, "+sky_color}}></div>
      <div style={{backgroundColor: sky_color}}>
      {tower.home?.floors?.references.nodes.map((floor) => (
      <div className="bg-transparent" key={floor.id} >
        {floor.active.value === "true" 
          ?
            <div className="relative" style={{zIndex: "2"}}><Image data={floor.image.reference.image} sizes="100%" />
              {floor.show_name?.value ==="true" && 
              <Link className="absolute inset-x-0 bottom-0 text-center invisible sm:visible" to={floor.link.value || ""}>
                <h2 className="">{floor.name?.value}</h2>
              </Link>}
            </div>

          :
          <div className="relative " style={{zIndex: "2"}}><Image data={floor.image.reference.image} sizes="100%" />
            {floor.show_name.value ==="true" && <h2 className="absolute inset-x-0 bottom-0 text-center invisible sm:visible">{floor.name.value}</h2>}
            </div>

        }
        </div>
        ))}
      </div>
    </> 
  
  )
}

function Clouds({
  clouds
} : {
  clouds: Promise<CloudsQuery | null>;
}) {
  return (
    <Suspense >
    <Await resolve={clouds}>
      {(response) => (
        <>
        {response ? (
          response.cloud.nodes.map((cloud) => {
            const pos = JSON.parse(cloud.position.value);
            const dur = 30;
            return (
            <div key={cloud.id} className="absolute top-[320px]">

              {cloud.image ? 
              <Image data={cloud.image.reference.image} width={cloud.image.reference?.image.width/2+"px"} 
              style={{position: "relative", 
                animationName: "cloud", 
                animationDuration: dur+"s", 
                animationIterationCount: "infinite", 
                animationTimingFunction: "linear",
                animationDelay: cloud.delay.value/10*dur+"s",
                top: pos[1]+"vw"}}
              /> 
              : null}
            </div>
          )})
        )
        : null
        }
        </>
      )}
    </Await>
    </Suspense>
  )
}



// function Tower( {
//   tower,
// } : {tower: Promise<TowerQuery | null>;} ) {
//   return (
//     <Suspense>
//       <Await resolve={tower}>
//         {(response) => (
//           <>
//           
//           <div>
//             {response 
//               ? (<div></div>)
//               : null
//             }
//           </div>
//           </>
//         )}
//         <div></div>
//       </Await>
//     </Suspense>
//   )
// }



function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      className="recommended-product"
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <h4>{product.title}</h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} />
                      </small>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const TOWER_QUERY = `#graphql
  fragment Floor on Metaobject {
    id,
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
    name: field(key: "name") {
      value
    }
    link: field(key: "link") {
      value,
    }
    active: field(key: "link_active") {
      value
    }
    show_name: field(key: "show_name") {
      value
    }
  }

  query Tower($handle: String!, $type: String!) {
    home: metaobject(handle: {handle: $handle, type: $type}) {
      id
      handle
      type
      floors: field(key: "floors") {
        references(first: 10) {
          nodes {
            ...Floor
          }
        }
      }
      color: field(key: "sky_colors") {
        value
        type
      }
      time: field(key: "time") {
        value
        type
      }
    }
  }
` as const;

const CLOUD_QUERY = `#graphql
query Clouds {
  cloud: metaobjects(type: "cloud", first: 20) {
    nodes {
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
      speed: field(key: "speed") {
        value
        type
      }
      delay: field(key: "delay") {
        value
        type
      }
      position: field(key: "position") {
        value
        type
      }
    }
  }
}
` as const;

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
