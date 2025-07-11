import {Image} from '@shopify/hydrogen';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import {useState} from 'react';
import {HEADER_QUERY} from '~/lib/fragments';
import type {FeaturedArtQuery, FeaturedExhibitionsQuery} from 'storefrontapi.generated';

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
  return {...featuredArt, ...featuredExhibitions, header};
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
  const {featuredArt, featuredExhibitions, header} = useLoaderData<typeof loader>();

  return (
    <div>
      <HomePageNav />
      <FeaturedArt featuredArt={featuredArt} />
      <AboutUs />
      <FeaturedExhibitions featuredExhibitions={featuredExhibitions} />
    </div>
  );
}

function HomePageNav() {
  return (
    <div className="flex flex-col items-center text-center m-10 lg:m-20">
      <h1 className=" text-4xl lg:text-8xl font-bold">JIAGIA STUDIOS</h1>
      <div className="flex flex-wrap gap-4 text-red-800 font-bold">
        <a href="/shop" className="hover:no-underline">
          SHOP
        </a>
        <a href="/lab" className="hover:no-underline">
          LAB
        </a>
        <a href="/exhibitions" className="hover:no-underline">
          EXHIBITIONS
        </a>
      </div>
    </div>
  );
}

function FeaturedArt({featuredArt}: {featuredArt: FeaturedArtQuery}) {
  const [active, setActive] = useState(0);
  const entries = featuredArt?.entries?.references?.nodes;
  return (
    <div>
      <div className="flex flex-col items-center gap-2 max-w-[450px] mx-auto text-center">
        <h2 className="text-3xl font-bold">FEATURED ART</h2>
        <p>Displayed in the Daydream Universe Artifact Gallery</p>
      </div>
      <div className="max-w-[80vw] mx-auto">
        <div className="my-8">
          <Image
            data={
              featuredArt.entries.references.nodes[active].image.reference.image
            }
          />
          <div className="flex flex-wrap justify-start gap-4">
            {JSON.parse(entries[active].caption.value)?.map((caption, index) => (
              <p className="mr-4"key={index}>{caption}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-start gap-4">
          {featuredArt.entries.references.nodes.map((entry, index) => (
            <div
              key={entry.id}
              onClick={() => setActive(index)}
              className={`hover:cursor-pointer ${active === index ? 'border-2 border-black' : ''}`}
            >
              <Image data={entry.image.reference.image} width={150} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutUs() {
  return (
    <div className="flex flex-col items-center gap-4 max-w-[450px] py-20 mx-auto text-center">
      <p>
        WE ARE A CREATIVE LABORATORY EXPLORING WORLDS WITHIN THE
        <span className="italic"> &quot;DAYDREAM UNIVERSE&quot;</span>
      </p>
      <p>
        FROM THESE JOURNEYS, WE GATHER ARTIFACTS AND CREATE ART INSPIRED BY
        FINDINGS
      </p>
      <Link to="/about">Learn More About Us</Link>
    </div>
  );
}

function FeaturedExhibitions({
  featuredExhibitions,
}: {
  featuredExhibitions: FeaturedExhibitionsQuery;
}) {
  const exhibitions = featuredExhibitions?.exhibitions?.references?.nodes;

  return (
    <div className="bg-black text-white py-20">
      <div className="flex flex-col items-center gap-2 max-w-[550px] mx-auto my-20 text-center">
        <h2 className="text-3xl font-bold">EXHIBITIONS</h2>
        <p>
          Our exhibitions are collection of works displayed within a
          dreamscape. Each one are based on our explorations and findings.
        </p>
      </div>
      <div className="flex flex-wrap justify-evenly my-20">
        {exhibitions.map((exhibition) =>
          <div key={exhibition.id} className="flex flex-col gap-4 max-w-[600px] text-wrap text-3xl">
            <Image
              data={exhibition?.poster?.reference?.image}
            />
            <h3>{exhibition.title.value}</h3>
            <p>{exhibition.description.value}</p>
          </div>
        )}
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
