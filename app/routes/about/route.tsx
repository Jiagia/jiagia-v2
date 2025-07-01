import {data, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction,} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
} from 'storefrontapi.generated';
import { Tower, TOWER_QUERY, CLOUD_QUERY} from './Tower';

import artistStatement from "~/assets/ArtistStatement.png"

export const meta: MetaFunction = () => {
  return [{title: 'About Us | Jiagia Studios'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return data({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const handle = 'about';

  const [{page}] = await Promise.all([
    storefront.query(PAGE_QUERY, {
      cache: storefront.CacheLong(),
      variables: {handle},
    }),
  ]);

  if (!page) {
    console.error(page);
    throw new Response(null, {status: 404});
  }

  return {
    page,
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

  return {
    tower,
    clouds,
  };
}

export default function AboutUs() {
  const data = useLoaderData<typeof loader>();
  const page = data.page
  
  return (
    <div className="">
      <div>
        <h1 className="mt-[240px] text-center text-[36px] dark:bg-black">ABOUT US</h1>
        <div className="mt-4 w-5/6 sm:w-1/3 mx-auto dark:bg-black" dangerouslySetInnerHTML={{__html: page.body}} />
      </div>
      <div className="dark dark:bg-black dark:text-white overflow-x-hidden">
        <Tower tower={data.tower} clouds={data.clouds} />
        <section className="relative">
          <img src={artistStatement} className="pt-48 md:pt-16 lg:pt-0"/>
          <div className="absolute top-0 w-full">
            <div className=" text-center sm:w-1/2 lg:w-1/3 mx-auto">
              <h2 className="text-[36px]">Artist Statement</h2>
              <br />
              <p>Parth creates art based on his experience and deep research conducted. He channels his experience and thoughts through the daydream universe story.</p>
              <br />
              <p>He hopes people reflect based on values and ideas expressed within these paintings.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query About($handle: String!) {
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
