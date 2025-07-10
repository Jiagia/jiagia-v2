import {Image} from '@shopify/hydrogen';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import {useState} from 'react';

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
  const handle = 'home-page';
  const type = 'featured_art';

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

  console.log(JSON.stringify(featuredArt));
  return featuredArt;
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
  const {featuredArt} = useLoaderData<typeof loader>();
  const entries = featuredArt?.entries.references.nodes;
  const [active, setActive] = useState(0);
  console.log(featuredArt);
  console.log(entries);
  console.log(entries[active]);
  console.log(JSON.parse(entries[active].caption.value));

  return (
    <div>
      <div className="flex flex-col items-center gap-2 max-w-[450px] mx-auto text-center text-3xl font-bold">
        <h1>FEATURED ART</h1>
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
      <div className="flex flex-col items-center gap-4 max-w-[450px] py-20 mx-auto text-center">
        <p>
          WE ARE A CREATIVE LABORATORY EXPLORING WORLDS WITHIN THE
          <span className="italic"> &quot;DAYDREAM UNIVERSE&quot;</span>
        </p>
        <p>
          FROM THESE JOURNEYS, WE GATHER ARTIFACTS AND CREATE ART INSPIRED BY OUR
          FINDINGS
        </p>
        <Link to="/about">Learn More About Us</Link>
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
