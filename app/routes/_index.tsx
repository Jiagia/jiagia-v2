import {Image} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData, type MetaFunction} from 'react-router';
import {useState} from 'react';
import {HEADER_QUERY} from '~/lib/fragments';
import type {
  FeaturedArtQuery,
  FeaturedExhibitionsQuery,
} from 'storefrontapi.generated';
import comingSoon from '~/assets/coming-soon.png'
import { Tower, TOWER_QUERY, CLOUD_QUERY} from '../components/Tower';
import artistStatement from '~/assets/ArtistStatement.png'
import hoodieManifesting from '~/assets/Hoodie Manifesting.png'

export const meta: MetaFunction = () => {
  return [{title: 'Jiagia Studios'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
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

  handle = 'gear';
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

  handle = 'artifacts-exhibition-1';

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

  // Query artwork collection
  const artworkHandle = 'artwork';
  const artwork = await context.storefront.query(ARTWORK, {
    cache: context.storefront.CacheLong(),
    variables: {handle: artworkHandle, first},
  });

  if (!artwork) {
    console.error(artwork);
    throw new Response('Artwork not found', {
      status: 404,
    });
  }

  // Query artist statement
  const artistStmtHandle = 'artist-statement';
  const artistStmt = await context.storefront.query(PAGE_QUERY, {
    cache: context.storefront.CacheLong(),
    variables: {handle: artistStmtHandle},
  });

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
    ...artwork,
    artistStmt,
    header,
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
    .catch((error: any) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  const clouds = context.storefront
    .query(CLOUD_QUERY)
    .catch((error: any) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    tower,
    clouds,
  };
}

export default function Homepage() {
  const {
    featuredArt,
    featuredExhibitions,
    gear,
    artifacts,
    artwork,
    artistStmt,
    tower,
    clouds,
    header,
  } = useLoaderData<typeof loader>();
  console.log(gear);
  console.log(artifacts);

  return (
    <>
      <div className="w-full">
        {/* <img 
          id="coming-soon"
          src={comingSoon} 
          alt="Coming Soon Image" 
          className="w-full h-full object-cover md:h-auto md:object-fill"
        /> */}
        {/* <div className="border border-black mx-4 md:mx-8 lg:mx-20"></div> */}
        {/* <FeaturedArtwork artwork={artwork} /> */}
        <HomePageNav />
        <FeaturedArt featuredArt={featuredArt} />
        <AboutUs />
        <FeaturedExhibitions featuredExhibitions={featuredExhibitions} />
        {/* <div className="py-12 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-6 md:gap-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center">
                GEAR
              </h2>
              <p className="text-center mx-auto max-w-xl">
                As you prepare to explore the infinite possibilities of the daydream universe perceptions, we have assembled the necessary gear for you to carry forward.
              </p>
              <div className="max-w-2xl w-full mx-auto">
                <img
                  src={hoodieManifesting} 
                  alt="Upcoming Products - Artifact Manifestation in Progress" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div> */}
        {/* <div>
          <Image
            src="https://cdn.shopify.com/s/files/1/0753/7868/8295/files/laboratory.png?v=1760504043"
          />
        </div> */}
        <FeaturedGear gear={gear} />
        <div className="border border-black mx-4 md:mx-8 lg:mx-20"></div>
        <FeaturedArtifacts artifacts={artifacts} />
      </div>
    </>
  );
}

function HomePageNav() {
  return (
    <div className="flex flex-col items-center text-center my-15 md:my-20 lg:my-30">
      <h1 className="text-3xl md:text-6xl lg:text-8xl font-bold mb-4 md:mb-6">
        &gt; JIAGIA STUDIOS &lt;
      </h1>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-bold text-red-900 text-sm md:text-base">
        <Link to="/exhibitions/lotus-world" className="hover:no-underline">
          EXHIBITIONS
        </Link>
        <Link to="/collections/all" className="hover:no-underline">
          SHOP
        </Link>
        <Link to="/about" className="hover:no-underline">
          ABOUT US
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
        {/* <h2 className="text-2xl md:text-3xl font-bold">FEATURED ART</h2> */}
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
              aspectRatio="4/3"
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
    <div className="flex flex-col items-center gap-4 max-w-2xl py-12 md:py-20 mx-auto text-center px-4 md:px-8 mb-8 md:mb-12">
      <p className="text-sm md:text-base leading-relaxed">
      Jiagia Studios is a creative collective and perceptual research unit. Our primary mission is to explore and document the Daydream Universe—a layered dimension that exists at the confluence of ancient mythology, collective memory, and our immersive digital present.
      </p>
      <p className="text-sm md:text-base leading-relaxed">
        In an age of accelerating information and fleeting attention, our work is an act of deep engagement. We believe that by observing, documenting, and reinterpreting these layered realities, we can build a new visual language—one that makes the unseen visible and gives form to the complex forces that shape our consciousness.
      </p>
      <p className="text-sm md:text-base leading-relaxed">
      The artifacts we create, from fine art paintings to digital "Sightings," are the published findings of our exploration. They are worlds to be entered and understood. We invite you to join our research, to engage with our findings, and to remember that what we choose to preserve, question, and imagine becomes the foundation for every future we build.
      </p>
    </div>
  );
}

function ArtistStatementText() {
  return (
    <div className="w-full pt-12 md:pt-20 pb-8 md:pb-12">
      <div className="text-center sm:w-1/2 lg:w-2/5 mx-auto px-4 md:px-8">
        <h2 className="bg-black bg-opacity-80 rounded-lg px-4 py-2 text-2xl md:text-[36px] mb-6 md:mb-8 inline-block">Artist Statement</h2>
        <div className="bg-black bg-opacity-80 rounded-lg p-4 md:p-6 text-center space-y-4">
          <p>
            Parth&apos;s work <b>examines the parallels between organized </b>religion and digital immersion, exploring how contemporary culture seeks meaning, comfort, and a sense of self through virtual experiences in the same way past generations sought divinity.
          </p>
          <p>
            Employing a vibrant, cartoon-inspired aesthetic rooted in internet iconography, Parth constructs dense, layered visual narratives. These layered compositions reflect the nonlinear way younger audiences engage with culture: not as a fixed history, but as a living dialogue of reverence, remix, and reinterpretation.
          </p>
          <p>
            The worlds he builds are not meant as simple escapes. Each piece is an invitation to the viewer: to enter these imagined realms, to reflect on their messages, and ultimately, to reconsider the realities we all inhabit.
          </p>
        </div>
      </div>
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
    <div
      className="bg-black text-white py-12 md:py-20 lg:py-32"
      style={{
        backgroundImage:
          'url(https://cdn.shopify.com/s/files/1/0753/7868/8295/files/stars.png?v=1735004828)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto mb-12 md:mb-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">EXHIBITIONS</h2>
          <p className="text-sm md:text-base leading-relaxed">
            Our exhibitions are collection of works displayed within a dreamscape. 
            Each one are based on our explorations and findings.
          </p>
        </div>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-auto"> */}
        <div className="grid grid-cols-1 gap-8 md:gap-12 max-w-7xl mx-auto">
          {exhibitions.map((exhibition: any) => (
            <div
              key={exhibition.id}
              className="flex flex-col items-center gap-4 text-center w-full max-w-md mx-auto"
            >
              <Link to={`/exhibitions/${exhibition.handle}`} className="w-full">
                <div className="w-full aspect-[3/4] relative rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    data={exhibition?.poster?.reference?.image}
                    className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
              </Link>
              <h3 className="text-lg md:text-2xl lg:text-3xl font-semibold mt-2">
                {exhibition.title.value}
              </h3>
              <p className="text-base md:text-lg leading-relaxed">
                {exhibition.description.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedGear({gear}: {gear: any}) {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          GEAR
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {gear?.products?.nodes?.map((product: any) => (
            <Link
              key={product.id}
              to={`/products/${product.handle}`}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-full">
                <Image 
                  data={product.featuredImage} 
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm md:text-base font-medium">
                {product.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedArtwork({artwork}: {artwork: any}) {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          ARTWORK
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {artwork?.products?.nodes?.map((product: any) => (
            <div
              key={product.id}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-full">
                <Image 
                  data={product.featuredImage} 
                  className="w-full h-auto"
                  aspectRatio="3/4"
                />
              </div>
              <p className="text-sm md:text-base font-medium">
                {product.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedArtifacts({artifacts}: {artifacts: any}) {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          ARTIFACTS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {artifacts?.products?.nodes?.map((product: any) => (
            <Link
              to={`/products/${product.handle}`}
              key={product.id}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-full">
                <Image 
                  data={product.featuredImage} 
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm md:text-base font-medium">
                {product.title}
              </p>
            </Link>
          ))}
        </div>
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
      references(first: 1) {
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

const ARTWORK = `#graphql
query Artwork($handle: String!, $first: Int!) {
  artwork: collection(handle: $handle) {
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

const PAGE_QUERY = `#graphql
  query Page($handle: String!) {
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
