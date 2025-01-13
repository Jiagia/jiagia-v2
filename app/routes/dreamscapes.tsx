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
import {Suspense, useState, useMemo} from 'react';

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
  const locations = universe.locations.references.nodes;
  const pathname = useLocation().pathname.split('/');
  // console.log(pathname);
  let handleIndex: number = -1;
  if (pathname.length >= 2) {
    for (let i = 0; i < locations.length; ++i) {
      // console.log(locations[i].handle);
      if (locations[i].handle === pathname[2]) {
        handleIndex = i;
      }
    }
  }
  // console.log(handleIndex);

  const [active, setActive] = useState<number>((handleIndex === -1) ? 0 : handleIndex);

  const prevButton = () => setActive((active - 1 + locations.length) % locations.length);
  const nextButton = () => setActive((active + 1) % locations.length);

  return (
    <div className="bg-black">
      {/* TODO: fix text spacing */}
      <div className="md:w-1/3 mx-8 md:mx-auto my-16 text-center">
        {universe.caption?.value
          .split('\n')
          .map((phrase: string, index: number) => (
            <p key={index}>{phrase}</p>
          ))}
      </div>
      {/* TODO: add carousel */}
      {/* TODO: change location image/chapters when switching locations */}
      <div className="flex items-center justify-evenly min-gap-4 mb-8 overflow-hidden">
        <Image
          className="hidden lg:block"
          data={locations[(active - 2 + locations.length) % locations.length].image.reference.image}
          width={150}
        />
        <Image
          className="hidden sm:block"
          data={locations[(active - 1 + locations.length) % locations.length].image.reference.image}
          width={150}
        />
        <div className="flex justify-center items-center">
          <button onClick={prevButton}>
            <Link
              className="hover:no-underline"
              to={locations[(active - 1 + locations.length) % locations.length].handle}
              preventScrollReset
            >
              &lt;
            </Link>
          </button>
          <div className="text-center bg-black border-black border">
            <Image
              className="w-[300px]"
              data={locations[active].image.reference.image}
              width={300}
            />
            <h3>{locations[active].title.value}</h3>
          </div>
          <button onClick={nextButton}>
            <Link
              className="hover:no-underline"
              to={locations[(active + 1) % locations.length].handle}
              preventScrollReset
            >
              &gt;
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
          width={150}
        />
      </div>
      <div>
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
  }
}
` as const;
