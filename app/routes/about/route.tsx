import {data, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction,} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
} from 'storefrontapi.generated';
import { Tower, TOWER_QUERY, CLOUD_QUERY} from './Tower';

export const meta: MetaFunction = () => {
  return [{title: 'About - Jiagia Studios'}];
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

  return {
    tower,
    clouds,
  };
}

export default function AboutUs() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="dark">
      <div className="dark:bg-black dark:text-white overflow-x-hidden">
      
      <Tower tower={data.tower} clouds={data.clouds} />
  
      </div>
    </div>
  );
}