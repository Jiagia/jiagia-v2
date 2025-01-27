import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Image} from '@shopify/hydrogen';
import {
  Await,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useAsyncValue,
  type MetaFunction,
} from '@remix-run/react';
import {Suspense, useState, useEffect, useMemo} from 'react';

export const meta: MetaFunction = () => {
  return [{title: 'Dreamscapes'}];
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);

  const criticalData = loadCriticalData(args);

  return defer({...deferredData, criticalData});
}

async function loadCriticalData({context}: LoaderFunctionArgs) {
  const handle = 'dreamscape-carousel';
  const type = 'universe';

  const universe = await context.storefront.query(UNIVERSE_QUERY, {
    // cache: context.storefront.CacheLong(),
    variables: {handle, type},
  });

  if (!universe) {
    console.error(universe);
    throw new Response('Daydream Universe not found', {
      status: 404,
    });
  }
  return universe;
}

function loadDeferredData(args: LoaderFunctionArgs) {
  return {};
}

export default function Dreamscapes() {
  const universe = useLoaderData<typeof loader>();
  // console.log(universe);
  // console.log(universe.criticalData);
  return (
    <Suspense>
      <Await resolve={universe.criticalData}>
        <LocationCarousel />
      </Await>
    </Suspense>
  );
}

function LocationCarousel() {
  const {universe} = useAsyncValue();
  const locations = universe?.locations?.references?.nodes;
  const pathname = useLocation().pathname.split('/');
  // console.log(pathname);
  let handleIndex = -1;
  if (pathname.length >= 2 && locations) {
    for (let i = 0; i < locations.length; ++i) {
      // console.log(locations[i].handle);
      if (locations[i].handle === pathname[2]) {
        handleIndex = i;
      }
    }
  }

  const [active, setActive] = useState<number>(
    handleIndex === -1 ? 0 : handleIndex,
  );

  const prevButton = () => {
    if (locations) {
      setActive((active - 1 + locations.length) % locations.length);
    }
  };
  const nextButton = () => {
    if (locations) {
      setActive((active + 1) % locations.length);
    }
  };

  return (
    <div
      className="relative h-full my-[-125px] pt-[125px]"
      style={{
        backgroundImage: `url(${universe?.backgroundImg?.reference?.image?.url})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* TODO: fix text spacing */}
      <div className="bg-black md:w-1/3 flex flex-col justify-center items-center gap-2 mx-8 md:mx-auto my-16 text-center">
        {(universe?.caption?.value ?? '')
          .split('\n')
          .map((phrase: string, index: number) => (
            <p key={index}>{phrase}</p>
        ))}
      </div>
      {/* TODO: add carousel */}
      {/* TODO: change location image/chapters when switching locations */}
      <div className="h-[350px] flex items-center justify-evenly overflow-hidden">
        <Image
          className="hidden lg:block"
          data={locations[(active - 2 + locations.length) % locations.length].image.reference.image}
          width={75}
        />
        <Image
          className="hidden sm:block"
          data={locations[(active - 1 + locations.length) % locations.length].image.reference.image}
          width={150}
        />
        <div className="flex md:gap-4 justify-center md:justify-between items-center">
          <button className='bg-black text-4xl md:text-5xl hover:scale-150' onClick={prevButton}>
            <Link
              className="hover:no-underline"
              to={locations[(active - 1 + locations.length) % locations.length].handle}
              preventScrollReset
            >
              &gt;
            </Link>
          </button>
          <div className="text-center border-black border">
            <Image
              className="bg-transparent"
              data={locations[active].image.reference.image}
              width={300}
            />
          </div>
          <button className='bg-black text-4xl md:text-5xl hover:scale-150' onClick={nextButton}>
            <Link
              className="hover:no-underline"
              to={locations[(active + 1) % locations.length].handle}
              preventScrollReset
            >
              &lt;
            </Link>
          </button>
        </div>
        <Image
          className="hidden sm:block"
          data={locations[(active + 1) % locations.length].image.reference.image}
          width={150}
        />
        <Image
          className="hidden lg:block"
          data={locations[(active + 2) % locations.length].image.reference.image}
          width={75}
        />
      </div>
      <div className="h-[275px] max-w-[300px] flex flex-col justify-start items-center gap-4 mx-auto mb-4 md:mb-8 text-center bg-transparent">
        <h3
          className="bg-black font-bold text-3xl"
          style={{ color: locations[active].color.value }}
        >
          {locations[active].title.value}
        </h3>
        <p className="max-w-[300px] bg-black">{locations[active].description.value}</p>
      </div>
      <div className="mb-32">
        <Image data={universe.image.reference.image} />
      </div>
      {/* <Outlet /> */}
    </div>
  );
}

const UNIVERSE_QUERY = `#graphql
fragment Location on Metaobject {
  id
  handle
  title: field(key: "title") {
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
  link: field(key: "link") {
    value
  }
  color: field(key: "color") {
    value
  }
}

query Universe($handle: String!, $type: String!) {
  universe: metaobject(handle: {handle: $handle, type: $type}) {
    id
    handle
    organization: field(key: "dreamscape_organization") {
      value
    }
    caption: field(key: "caption") {
      value
    }
    image: field(key: "background_image") {
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
    locations: field(key: "locations") {
      references(first: 10) {
        nodes {
          ... on Metaobject {
            ...Location
          }
        }
      }
    }
    backgroundImg: field(key: "background") {
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
}
` as const;
