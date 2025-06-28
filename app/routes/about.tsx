import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction,} from '@remix-run/react';
import {Suspense, useState, useEffect, useCallback, useMemo} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  TowerQuery,
  CloudsQuery,
} from 'storefrontapi.generated';

export const meta: MetaFunction = () => {
  return [{title: 'About - Jiagia Studios'}];
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
  return {
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {  
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
    tower,
    clouds,
    planets,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="home dark">
      <div className="dark:bg-black dark:text-white overflow-x-hidden">
      
      <div className="relative overflow-hidden ">
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
      </div>
    </div>
  );
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
      <div className={" h-[360px] w-full font-bold"} style={{backgroundImage: "linear-gradient(to bottom, black, "+sky_color}}></div>        
      <div className="font-bold" style={{backgroundColor: sky_color}}>
        {tower?.home?.floors?.references?.nodes.map((floor) => (
          <div className="bg-transparent relative" style={{zIndex: 2}} key={floor.id} >
            <Image data={floor?.image?.reference?.image} sizes="100%" />
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