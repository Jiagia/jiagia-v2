import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  return (
    <div>
      {compareAtPrice ? (
        <div className="flex gap-3 items-center">
          {price ? <Money data={price} /> : null}
          <s className="opacity-50 text-gray-400">
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <div className="text-xl font-semibold text-black">
          <Money data={price} />
        </div>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
