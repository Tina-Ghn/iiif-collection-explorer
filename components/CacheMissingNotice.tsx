export function CacheMissingNotice() {
  return (
    <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-amber-950 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Collection Cache Missing</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">Generate the local cache first.</h2>
      <p className="mt-4 max-w-2xl leading-7 text-amber-900">
        The explorer reads from <code>data/museum-objects.json</code> so the user experience does not depend on the
        upstream IIIF server. Run the sync command once, then refresh this page.
      </p>
      <pre className="mt-6 overflow-x-auto rounded-2xl bg-white p-4 text-sm text-stone-950">npm run sync-collection</pre>
    </section>
  );
}
