import {data, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import { Footer } from '~/components/Footer';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Subscribe | Jiagia Studios`}];
};

export async function loader(args: LoaderFunctionArgs) {
//   throw redirect('/');
  // Start fetching non-critical data without blocking time to first byte
//   const deferredData = loadDeferredData(args);

//   // Await the critical data required to render initial state of the page
//   const criticalData = await loadCriticalData(args);

//   return data({...deferredData, ...criticalData});
}


/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
//   const {storefront} = context;
//   const paginationVariables = getPaginationVariables(request, {
//     pageBy: 8,
//   });

//   const [{products}] = await Promise.all([
//     storefront.query(CATALOG_QUERY, {
//       variables: {...paginationVariables},
//     }),
//     // Add other queries here, so that they are loaded in parallel
//   ]);
//   return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Subscribe() {
    return (
        <div className="mt-16">
            <div className="klaviyo-form-SYV6SN"></div>
        </div>
    )

}