import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li key={id} className="md:grid md:grid-cols-3 md:gap-8 py-6 border-b border-gray-200 md:items-center last:border-b-0 space-y-3 md:space-y-0">
      {/* Product section - spans full width on mobile, first column on desktop */}
      <div className="flex gap-4 items-start md:justify-self-start">
        {image && (
          <div className="flex-shrink-0">
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={120}
              loading="lazy"
              width={120}
              className="rounded bg-white"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
            className="text-lg font-medium text-black hover:underline block mb-2 leading-snug"
          >
            {product.title}
          </Link>
          <div className="mb-2 text-sm hidden md:block">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
          <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
            {selectedOptions.map((option) => (
              <span key={option.name} className="text-sm text-gray-600">
                {option.name}: {option.value}
              </span>
            ))}
          </div>
          {/* Mobile price - show under product details */}
          <div className="md:hidden text-sm font-medium">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>
        </div>
      </div>
      
      {/* Quantity section - centered on desktop */}
      <div className="flex justify-between md:justify-center items-center">
        <span className="md:hidden text-sm font-medium text-gray-700">Quantity</span>
        <CartLineQuantity line={line} />
      </div>
      
      {/* Total section - right aligned on desktop */}
      <div className="flex justify-between md:justify-end items-center">
        <span className="md:hidden text-sm font-medium text-gray-700">Total</span>
        <div className="font-medium md:text-right">
          <ProductPrice price={line?.cost?.totalAmount} />
        </div>
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="bg-none border-none px-2 sm:px-3 py-1 sm:py-2 cursor-pointer text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            −
          </button>
        </CartLineUpdateButton>
        <span className="px-2 sm:px-4 py-1 sm:py-2 border-l border-r border-gray-300 text-sm min-w-6 sm:min-w-8 text-center bg-white">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="bg-none border-none px-2 sm:px-3 py-1 sm:py-2 cursor-pointer text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            +
          </button>
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button 
        disabled={disabled} 
        type="submit" 
        className="bg-none border-none p-2 cursor-pointer text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
        aria-label="Remove item"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.152l.557 10.055A2 2 0 0 0 5.046 16h5.908a2 2 0 0 0 1.993-1.793l.557-10.055A.58.58 0 0 0 13.494 2.5H11ZM9 2.5H7v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1Zm1.968 1.447-.557 10.055A1 1 0 0 1 10.954 15H5.046a1 1 0 0 1-.996-.998L3.493 3.947h8.014ZM6.5 5.5A.5.5 0 0 1 7 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Z"/>
        </svg>
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}
