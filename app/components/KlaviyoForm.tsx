interface KlaviyoFormProps {
  newsletterLink: string;
}

export function KlaviyoForm({newsletterLink}: KlaviyoFormProps) {
  return (
    <div className="w-full flex flex-col md:flex-row md:justify-evenly items-center text-center gap-y-4 md:gap-y-0 md:gap-x-20 px-4 md:px-8">
      <p className="w-full md:w-1/2">
        Join our email list for exclusive products and offers!
      </p>
      <a
        className="w-full md:w-1/2 bg-black hover:bg-white text-white hover:text-black hover:no-underline border border-white p-2"
        rel="noopener noreferrer"
        href={newsletterLink}
        target="_blank"
      >
        &gt; Subscribe &lt;
      </a>
    </div>
  );
}
