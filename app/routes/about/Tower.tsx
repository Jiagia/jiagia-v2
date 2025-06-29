import {Await, Link,} from '@remix-run/react';
import {Suspense, useState, useEffect, useCallback, useMemo} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  TowerQuery,
  CloudsQuery,
} from 'storefrontapi.generated';

export function Tower({
  tower,
  clouds,
}: {
  tower: Promise<TowerQuery | null>;
  clouds: Promise<CloudsQuery | null>;
}) {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={tower}>
          {(response) => (
            <div className="relative md:min-h-[120wh]">
            {
              response ? <TowerBuidling tower={response} /> : null
            }
            </div>
          )}
        </Await>
      </Suspense>

      <Suspense >
        <Await resolve={clouds}>
          {(response) => (
            <>
            {
              response ? <Clouds clouds={response} /> : null
            }
            </>
          )}
        </Await>
      </Suspense>
    </div>
  )

}

function TowerBuidling({
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

  return (
    <>
      <div className={" h-[360px] w-full font-bold"} style={{backgroundImage: "linear-gradient(to bottom, white, " + sky_color}}>

        <nav className="flex flex-col justify-start items-center h-5/6 space-y-5 text-[18px] sm:invisible ">
          <Link className="border-2 p-2 border-white rounded-xl" to="/about">&gt; ABOUT US &lt;</Link>
          {/* <Link className="pointer-events-none" to="/shop">&gt; SHOP &lt;</Link>
          <Link className="pointer-events-none" to="/lab">&gt; LABORATORY &lt;</Link> */}
        </nav>
      </div>
        
      <div className="font-bold" style={{backgroundColor: sky_color}}>
        {tower.home?.floors?.references?.nodes.map((floor) => (
          <div className="bg-transparent relative" style={{zIndex: 2}} key={floor.id} >

            <Image data={floor.image?.reference?.image} sizes="100%" />
            {floor.show_name && floor.show_name.value === "true" ? 
              (
                <Link className="absolute inset-x-0 bottom-0 text-center invisible sm:visible hover:no-underline lg:mb-1 lg:text-[16px]" 
                to={floor.link?.value || ""} 
                style={{pointerEvents: floor.active && floor.active.value ==="true" ? "auto" : "none"}}
                >
                    <h2 className="mx-auto md:p-1 xl:p-2 w-fit border border-white rounded-xl">{floor.name?.value}</h2>
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
  clouds: CloudsQuery;
}) {
  return (
    <>
    {clouds.cloud.nodes.map((cloud) => {
      const pos = JSON.parse(cloud.position?.value || "[0,0]");
      const dur = 30;
      const delay = parseInt(cloud.delay?.value || "0");
      return (
      <div key={cloud.id} className="absolute top-[320px]">

        {cloud.image ? 
        <Image data={cloud.image.reference?.image} sizes="50vw"
        style={{position: "relative", 
          animationName: "cloud", 
          animationDuration: dur+"s", 
          animationIterationCount: "infinite", 
          animationTimingFunction: "linear",
          animationDelay: delay/10*dur+"s",
          top: pos[1]+"vw",
          width: cloud.image?.reference?.image?.width/2+"px"}}
        /> 
        : null}
      </div>
    )})}
    </>
  )
}

export const TOWER_QUERY = `#graphql
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

export const CLOUD_QUERY = `#graphql
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
