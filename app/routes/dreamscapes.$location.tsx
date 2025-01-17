import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Image} from '@shopify/hydrogen';
import {
  Await,
  Link,
  useAsyncValue,
  useLoaderData,
  type MetaFunction,
} from '@remix-run/react';
import {Suspense} from 'react';

export const meta: MetaFunction = () => {
  return [{title: 'Dreamscapes - Location'}];
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);

  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, criticalData});
}

async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const handle = '';
  return null;
}

function loadDeferredData({context, params}: LoaderFunctionArgs) {
  const {location} = params;
  const type = 'location';

  const locationInfo = context.storefront.query(LOCATION_QUERY, {
    // cache: context.storefront.CacheLong(),
    variables: {location, type},
  });

  if (!locationInfo) {
    throw new Response(`Location ${location} not found`, {
      status: 404,
    });
  }

  return {
    locationInfo,
  };
}

export default function Dreamscape() {
  const data = useLoaderData<typeof loader>();
  return (
    <Suspense>
      <Await resolve={data.locationInfo}>
        <DreamscapeNav />
      </Await>
    </Suspense>
  );
}

function DreamscapeNav() {
  const {locationInfo} = useAsyncValue();
  // console.log(locationInfo);

  return (
    <div className="mb-32 md:flex md:justify-evenly md:items-center">
      {/* todo: fix spacing */}
      {/* <div className="hidden md:block md:w-1/3 text-center"> */}
      <div className="p-10 flex flex-col justify-center items-center gap-8 md:w-1/3 text-center">
        <h2 className="bg-black text-2xl">{locationInfo.title.value}</h2>
        <p className="bg-black">{locationInfo.description.value}</p>
        <div className="bg-black md:w-1/2 md:mx-auto">
          <Image data={locationInfo.image.reference.image} />
        </div>
      </div>
      {/* <div className="text-center flex flex-col gap-4">
        {locationInfo.chapters?.references.nodes.map((chapter) => {
          // TODO: make sure all chapter buttons are the same width and have correct spacing
          return (
            <div key={chapter.id} className="border hover:cursor-pointer hover:bg-white hover:text-black border-white py-2 px-8">
              <Link to={chapter.link.value} className="text-xl hover:no-underline">
                {chapter.title.value}
              </Link>
            </div>
          );
        })}
      </div> */}
    </div>
  );
}

const LOCATION_QUERY = `#graphql
  fragment Chapter on Metaobject {
    id
    title: field(key: "title") {
      value
      type
    }
    link: field(key: "link") {
      value
      type
    }
    active: field(key: "active") {
      value
      type
    }
  }

  query Location($location: String!, $type: String!) {
    locationInfo: metaobject(handle: {handle: $location, type: $type}) {
      id
      handle
      type
      title: field(key: "title") {
        value
        type
      }
      description: field(key: "description") {
        value
        type
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
        type
      }
      chapters: field(key: "chapters") {
        references(first: 5) {
          nodes {
            ... on Metaobject {
              ...Chapter
            }
          }
        }
      }
    }
  }
` as const;
