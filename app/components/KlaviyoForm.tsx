

export function KlaviyoForm({newsletterLink}) {
  return (
    <div className="flex flex-col items-center text-center gap-2 px-8">
      <p>Join our email list for exclusive info and offers!</p>
      <a
        className="w-full hover:font-black hover:no-underline bg-white text-black p-2"
        href={newsletterLink}
        target="_blank"
      >
        &gt; Subscribe &lt;
      </a>
      <div className="hidden md:flex flex-col gap-2">
        <p className="text-xs">We use email and targeted online advertising to send you product and services updates, promotional offers and other marketing communications based on the information we collect about you, such as your email address, general location, and purchase and website browsing history.</p>
        <p className="text-xs">We process your personal data as stated in our Privacy Policy. You may withdraw your consent or manage your preferences at any time by clicking the unsubscribe link at the bottom of any of our marketing emails, or by emailing us at contact@jiagia.com.</p>
      </div>
    </div>
  );
}