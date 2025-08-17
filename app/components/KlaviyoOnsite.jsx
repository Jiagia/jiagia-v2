export function trackViewedProduct(product) {
    let klaviyo = window.klaviyo || [];
    let item = {
        Name: product.title,
        ProductID: product.id.substring(product.id.lastIndexOf('/') + 1),
        ImageURL: product.image.url,
        Handle: product.handle,
        Brand: product.vendor,
        Price: product.price.amount,
        Metadata: {
          Brand: product.vendor,
          Price: product.unitPrice,
          CompareAtPrice: product.compareAtPrice
        }
};
klaviyo.push(['track', 'Hydrogen Viewed Product', item]);
klaviyo.push(['trackViewedItem', item]);


}

export function trackAddedToCart(product) {
let klaviyo = window.klaviyo || []
let item = {
        Name: product.title,
        ProductID: product.id.substring(product.id.lastIndexOf('/') + 1),
        ImageURL: product.image.url,
        Handle: product.handle,
        Brand: product.vendor,
        Price: product.price.amount
      }
      klaviyo.push(['track', 'Hydrogen Added To Cart', item])
}