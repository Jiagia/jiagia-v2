import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction,} from '@remix-run/react';
import {Suspense, useState, useEffect, useCallback, useMemo} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
  TowerQuery,
  CloudsQuery,
  PlanetsQuery,
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

    const planets = context.storefront
    .query(PLANETS)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
    tower,
    clouds,
    planets,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="home dark">
      {/* <div className="klaviyo-form-UtiWXz"></div> */}
      <div className="dark:bg-black dark:text-white">
       <Planets planets={data.planets}></Planets>
      
      <div className="relative overflow-hidden">
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



function Planets({planets} : {planets: Promise<PlanetsQuery | null>}) {

  // const getRandomObject = (array) => {
  //   const randomObject = array[Math.floor(Math.random() * array.length)];
  //   return randomObject;
  // };
  
  // const MyComponent = () => {
  //   const [randomData, setRandomData] = useState(() => getRandomObject(DATA));
  // // generate stars
  let starsX: number[] = new Array(100);
  for (let i=0; i<starsX.length; i++) starsX[i] = Math.random()*200;

  let starsY: number[] = new Array(100);
  for (let i=0; i<starsY.length; i++) starsY[i] = Math.random()*200;

  let smallStarsX: number[] = new Array(50);
  for (let i=0; i<smallStarsX.length; i++) smallStarsX[i] = Math.random()*200;

  let smallStarsY: number[] = new Array(50);
  for (let i=0; i<smallStarsY.length; i++) smallStarsY[i] = Math.random()*200;
  
  return (
    <div className="pt-40 h-full overflow-x-hidden">
      
      {starsX.map((star, i) => (
        <div key={i} 
        style={{position: "absolute", 
                top: star+"%", 
                left: starsY[i]+"%", 
                fontSize: "10px"
              }}
          >
          &#10022;
        </div>
      ))
      }

      {smallStarsX.map((star, i) => (
        <div key={i} 
        style={{position: "absolute", 
                top: star+"%", 
                left: smallStarsY[i]+"%", 
                fontSize: "6px"
              }}
          >
          &#10038;
        </div>
      ))}

      <Suspense >
        <Await resolve={planets}>
          {(response) => (
            <>
            {response ? (
              
              response.planets.nodes.map((planet) => {
                const pos_d : String[] = JSON.parse(planet.pos_d?.value || '["0", "0"]');
                const size : String[] = JSON.parse(planet.size.value);

                return (
                <div key={planet.id} className="" style={{zIndex:1}}>

                  {planet.image ? 
                  <Image className="" data={planet.image.reference.image} sizes={size[0]+"%"}
                  style={{position: "absolute", left:pos_d[0]+"%", top: pos_d[1]+"%", width: size[0]+"%"}}
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
      
      <div className="min-h-32"></div>
      <div className="p-8 max-w-[400px] mx-auto text-center ">
        <p className="dark:bg-black relative z-0">WE ARE A CREATIVE LABORATORY EXPLORING WORLDS WITHIN THE <i><strong>“DAYDREAM UNIVERSE”</strong></i> </p>
        
        <p className="dark:bg-black relative z-0 mt-[2rem]">FROM THESE JOURNEYS, WE GATHER ARTIFACTS AND CREATE ART INSPIRED BY OUR FINDINGS </p>

        <div className="flex justify-center items-center">
          <img className="mt-40 z-2" src={lumaperl} style={{zIndex:1}}/>
        </div>

        <h4 className="mt-4 text-[32px] text-slate-800 font-bold bg-black z-0 relative">COMING SOON</h4>
        <div className="invisible font-bold">
          <h5 className=" my-4 text-[60px] md:text-[64px] text-[#896997] ">LUMAPERL</h5>

          <Link to="/dreamscape/lumaperl">
            <h4 className="border border-white border-2 text-[16px]"> &gt; VIEW LATEST EXPEDITION &lt; </h4>
          </Link>

          <div className="min-h-32"></div>
        
        </div>
        
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
  const colors : any = JSON.parse(tower.home.color?.value || "[\"#000000\",\"#8deaff\"]");
  const time : any = JSON.parse(tower.home.time?.value || "[8, 24]");

  const [date, setDate] = useState(new Date());
  useEffect(() => {
      const timerID = setInterval(() => tick(), 1000*60);
      return () => clearInterval(timerID);
  }, []);

  const tick = useCallback(() => {
      setDate(new Date());
  }, []);

  const hr = useMemo(() => date.getHours(), [date]);
  let i = 0
  for (i = 0; i < time.length; i++) {
    if (hr < time[i]) break;
  }
  const sky_color = colors[i].toString();
 console.log(sky_color)

  return (
    <>
      <div className={" h-[360px] w-full font-bold"} style={{backgroundImage: "linear-gradient(to bottom, black, "+sky_color}}>

        <nav className="flex flex-col justify-start items-center h-5/6 space-y-5 text-[18px]  sm:invisible ">
          <Link to="/about">&gt; ABOUT US &lt;</Link>
          {/* <Link className="pointer-events-none" to="/shop">&gt; SHOP &lt;</Link>
          <Link className="pointer-events-none" to="/lab">&gt; LABORATORY &lt;</Link> */}
        </nav>
      </div>
        
      <div className="font-bold" style={{backgroundColor: sky_color}}>
        {tower.home?.floors?.references.nodes.map((floor) => (
          <div className="bg-transparent relative" style={{zIndex: 2}} key={floor.id} >

            <Image data={floor.image.reference.image} sizes="100%" />
            {floor.show_name && floor.show_name.value === "true" ? 
              (
                <Link className="absolute inset-x-0 bottom-0 text-center invisible sm:visible hover:no-underline lg:mb-2 lg:text-[16px]" 
                to={floor.link?.value || ""} 
                style={{pointerEvents: floor.active && floor.active.value ==="true" ? "auto" : "none"}}
                >
                    <h2 className="">{floor.name?.value}</h2>
                  </Link>
              )
              : null
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
              <Image data={cloud.image.reference.image} sizes="50vw"
              style={{position: "relative", 
                animationName: "cloud", 
                animationDuration: dur+"s", 
                animationIterationCount: "infinite", 
                animationTimingFunction: "linear",
                animationDelay: cloud.delay.value/10*dur+"s",
                top: pos[1]+"vw",
                width: cloud.image.reference?.image.width/2+"px"}}
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

const PLANETS = `#graphql
query Planets {
  planets: metaobjects(type: "planet", first: 20) {
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
      pos_m: field(key: "pos_m") {
        value
        type
      }
      pos_d: field(key: "pos_d") {
        value
        type
      }
      index: field(key: "index") {
        value
        type
      }
    }
  }
}
` as const

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
