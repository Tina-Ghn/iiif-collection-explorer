# IIIF Collection Explorer

A Next.js 15 application for browsing manifests from a configurable IIIF Collection.

## Getting Started

Install dependencies:

```bash
npm install
```

Generate the local collection cache:

```bash
npm run sync-collection
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configure the Collection

Create `.env.local` and set the IIIF Collection URL:

```bash
IIIF_COLLECTION_URL=https://example.org/iiif/collection.json
```

For offline development, use the bundled sample collection:

```bash
IIIF_COLLECTION_URL=local:sample-collection
```

The frontend reads from `data/museum-objects.json`, not from the upstream IIIF server. To manually refresh the cache after changing `IIIF_COLLECTION_URL`, run:

```bash
npm run sync-collection
```

The cache includes `generatedAt`, the original collection source URL, each manifest source URL, normalized object metadata, thumbnails, and resolved detail image URLs.

The parser supports IIIF Presentation API v2 and v3 collection shapes, including v3 `items`, v2 `manifests`, v3 `id`/`type`, v2 `@id`/`@type`, v3 canvas annotations, v2 `sequences`, language maps, metadata, thumbnails, and source links.

## Project Structure

- `app/` contains the App Router homepage and item detail route.
- `components/` contains reusable UI components for cards, grids, metadata, and detail views.
- `lib/` contains IIIF TypeScript interfaces, fetch helpers, normalization logic, and route encoding utilities.

