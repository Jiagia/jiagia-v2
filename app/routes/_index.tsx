import {Image} from '@shopify/hydrogen';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import {useState} from 'react';
import {HEADER_QUERY} from '~/lib/fragments';
import type {
  FeaturedArtQuery,
  FeaturedExhibitionsQuery,
} from 'storefrontapi.generated';

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
  let handle = 'home-page';
  let type = 'featured_art';

  const featuredArt = await context.storefront.query(FEATURED_ART, {
    cache: context.storefront.CacheLong(),
    variables: {handle, type},
  });

  if (!featuredArt) {
    console.error(featuredArt);
    throw new Response('Featured Art not found', {
      status: 404,
    });
  }

  handle = 'featured-exhibitions';
  type = 'exhibition_collection';

  const featuredExhibitions = await context.storefront.query(
    FEATURED_EXHIBITIONS,
    {
      cache: context.storefront.CacheLong(),
      variables: {handle, type},
    },
  );

  if (!featuredExhibitions) {
    console.error(featuredExhibitions);
    throw new Response('Featured Exhibitions not found', {
      status: 404,
    });
  }

  handle = 'season-4';
  const first = 3;

  const gear = await context.storefront.query(GEAR, {
    cache: context.storefront.CacheLong(),
    variables: {handle, first},
  });

  if (!gear) {
    console.error(gear);
    throw new Response('Gear not found', {
      status: 404,
    });
  }

  handle = 'season-3';

  const artifacts = await context.storefront.query(ARTIFACTS, {
    cache: context.storefront.CacheLong(),
    variables: {handle, first},
  });

  if (!artifacts) {
    console.error(artifacts);
    throw new Response('Artifacts not found', {
      status: 404,
    });
  }

  const [header] = await Promise.all([
    context.storefront.query(HEADER_QUERY, {
      cache: context.storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  console.log(JSON.stringify(header));

  console.log(JSON.stringify(featuredArt));
  console.log(JSON.stringify(featuredExhibitions));
  return {
    ...featuredArt,
    ...featuredExhibitions,
    ...gear,
    ...artifacts,
    header,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Homepage() {
  const {
    featuredArt,
    featuredExhibitions,
    gear,
    artifacts,
    header,
  } = useLoaderData<typeof loader>();
  console.log(gear);
  console.log(artifacts);

  return (
    <div>
      <HomePageNav />
      <FeaturedArt featuredArt={featuredArt} />
      <AboutUs />
      <FeaturedExhibitions featuredExhibitions={featuredExhibitions} />
      <FeaturedGear gear={gear} />
      <div className="border border-black mx-4 md:mx-8 lg:mx-20"></div>
      <FeaturedArtifacts artifacts={artifacts} />
    </div>
  );
}

function HomePageNav() {
  return (
    <div className="flex flex-col items-center text-center p-6 md:p-10 lg:p-20">
      <h1 className="text-3xl md:text-6xl lg:text-8xl font-bold mb-4 md:mb-6">
        JIAGIA STUDIOS
      </h1>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-red-800 font-bold text-sm md:text-base">
        <Link to="/shop" className="hover:no-underline">
          SHOP
        </Link>
        <Link to="/lab" className="hover:no-underline">
          LAB
        </Link>
        <Link to="/exhibitions" className="hover:no-underline">
          EXHIBITIONS
        </Link>
      </div>
    </div>
  );
}

function FeaturedArt({featuredArt}: {featuredArt: FeaturedArtQuery}) {
  const [active, setActive] = useState(0);
  console.log(active);
  const entries = featuredArt?.entries?.references?.nodes;
  console.log(entries);
  
  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <div className="px-4 md:px-8 lg:px-16">
      <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">FEATURED ART</h2>
        <p className="text-sm md:text-base">
          Displayed in the Daydream Universe Artifact Gallery
        </p>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="w-full max-w-3xl mx-auto mb-4">
            <Image
              data={entries[active].image.reference.image}
              className="w-full h-auto"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-sm md:text-base">
            {JSON.parse(entries[active].caption.value)?.map((caption: string, index: number) => (
              <p className="px-2" key={index}>
                {caption}
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {entries.map((entry: any, index: number) => (
            <button
              key={entry.id}
              onClick={() => setActive(index)}
              className={`hover:cursor-pointer transition-all ${
                active === index ? 'border-2 border-black' : ''
              }`}
              aria-label={`View featured art ${index + 1}`}
            >
              <Image data={entry.image.reference.image} width={100} className="md:w-32 lg:w-36" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutUs() {
  return (
    <div className="flex flex-col items-center gap-4 max-w-lg py-12 md:py-20 mx-auto text-center px-4 md:px-8">
      <p className="text-sm md:text-base leading-relaxed">
        WE ARE A CREATIVE LABORATORY EXPLORING WORLDS WITHIN THE
        <span className="italic"> &quot;DAYDREAM UNIVERSE&quot;</span>
      </p>
      <p className="text-sm md:text-base leading-relaxed">
        FROM THESE JOURNEYS, WE GATHER ARTIFACTS AND CREATE ART INSPIRED BY
        FINDINGS
      </p>
      <Link 
        to="/about" 
        className="mt-4 text-sm md:text-base hover:underline"
      >
        Learn More About Us
      </Link>
    </div>
  );
}

function FeaturedExhibitions({
  featuredExhibitions,
}: {
  featuredExhibitions: FeaturedExhibitionsQuery;
}) {
  const exhibitions = featuredExhibitions?.exhibitions?.references?.nodes;

  if (!exhibitions || exhibitions.length === 0) {
    return null;
  }

  return (
    <div className="bg-black text-white py-12 md:py-20 lg:py-40 px-6 sm:px-14 md:px-20 lg:px-30 xl:px-40">
      <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto mb-12 md:mb-20 text-center px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold">EXHIBITIONS</h2>
        <p className="text-sm md:text-base leading-relaxed">
          Our exhibitions are collection of works displayed within a dreamscape. 
          Each one are based on our explorations and findings.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-8 lg:px-16">
        {exhibitions.map((exhibition: any) => (
          <div
            key={exhibition.id}
            className="flex flex-col gap-4 text-center"
          >
            <div className="w-full">
              <Image
                data={exhibition?.poster?.reference?.image}
                className="w-full h-auto"
              />
            </div>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold">
              {exhibition.title.value}
            </h3>
            <p className="text-sm md:text-base leading-relaxed">
              {exhibition.description.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedGear({gear}: {gear: any}) {
  return (
    <div className="py-12 md:py-20 px-4 md:px-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
        GEAR
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {gear?.products?.nodes?.map((product: any) => (
          <div
            key={product.id}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="w-full max-w-sm">
              <Image 
                data={product.featuredImage} 
                className="w-full h-auto"
              />
            </div>
            <p className="text-sm md:text-base font-medium">
              {product.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedArtifacts({artifacts}: {artifacts: any}) {
  return (
    <div className="py-12 md:py-20 px-4 md:px-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
        ARTIFACTS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {artifacts?.products?.nodes?.map((product: any) => (
          <div
            key={product.id}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="w-full max-w-sm">
              <Image 
                data={product.featuredImage} 
                className="w-full h-auto"
              />
            </div>
            <p className="text-sm md:text-base font-medium">
              {product.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURED_ART = `#graphql
fragment Entry on Metaobject {
  id
  handle
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
  caption: field(key: "caption") {
    value
  }
}
query FeaturedArt($handle: String!, $type: String!) {
  featuredArt: metaobject(handle: {handle: $handle, type: $type}) {
    id
    handle
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
}
` as const;

const FEATURED_EXHIBITIONS = `#graphql
fragment Exhibition on Metaobject {
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
}
query FeaturedExhibitions($handle: String!, $type: String!) {
  featuredExhibitions: metaobject(handle: {handle: $handle, type: $type}) {
    id
    handle
    title: field(key: "title") {
      value
    }
    exhibitions: field(key: "exhibitions") {
      references(first: 10) {
        nodes {
          ... on Metaobject {
            ...Exhibition
          }
        }
      }
    }
  }
}` as const;

const GEAR = `#graphql
query Gear($handle: String!, $first: Int!) {
  gear: collection(handle: $handle) {
    id
    handle
    products(first: $first) {
      nodes {
        id
        handle
        title
        featuredImage {
          id
          altText
          url
          width
          height
        }
      }
    }
  }
}
` as const;

const ARTIFACTS = `#graphql
query Artifacts($handle: String!, $first: Int!) {
  artifacts: collection(handle: $handle) {
    id
    handle
    products(first: $first) {
      nodes {
        id
        handle
        title
        featuredImage {
          id
          altText
          url
          width
          height
        }
      }
    }
  }
}
` as const;
