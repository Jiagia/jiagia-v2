export function KlaviyoForm({newsletterLink}) {
  return (
    <div className="flex flex-col items-center text-center gap-2 px-8">
      <p>Join our email list for exclusive info and offers!</p>
      <a
        className="w-full bg-black hover:bg-white text-white hover:text-black hover:no-underline border border-white p-2"
        rel="noopener noreferrer"
        href={newsletterLink}
        target="_blank"
      >
        &gt; Subscribe &lt;
      </a>
    </div>
  );
}
