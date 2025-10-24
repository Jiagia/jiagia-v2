import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = (cart?.totalQuantity ?? 0) > 0;

  return (
    <div className={`w-full ${className}`}>
      <CartEmpty hidden={linesCount} layout={layout} />
      {linesCount && (
        <div className="w-full">
          {/* Only show column headers for page layout, not aside */}
          {layout === 'page' && (
            <div className="hidden md:grid grid-cols-3 gap-8 pb-4 mb-4 text-xs font-medium uppercase tracking-wide text-black">
              <span className="justify-self-start">PRODUCT</span>
              <span className="justify-self-center">QUANTITY</span>
              <span className="justify-self-end">TOTAL</span>
            </div>
          )}
          <div aria-labelledby="cart-lines">
            <ul className="list-none p-0 m-0">
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>
          {cartHasItems && <CartSummary cart={cart} layout={layout} />}
        </div>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link to="/collections/all" onClick={close} prefetch="viewport">
        Continue shopping →
      </Link>
    </div>
  );
}
