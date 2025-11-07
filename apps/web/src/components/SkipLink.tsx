export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[1000] focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded"
    >
      Skip to content
    </a>
  );
}
