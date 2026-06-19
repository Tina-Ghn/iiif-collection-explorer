import type {
  IIIFCollectionItem,
  IIIFCollection,
  IIIFManifest,
  NormalizedIIIFCollection,
  NormalizedIIIFManifest,
} from "@/lib/iiif-types";
import {
  getCollectionManifestItems,
  getManifestDescription,
  getManifestId,
  getManifestSource,
  getManifestThumbnail,
  getManifestTitle,
  getResourceId,
  getText,
  normalizeMetadata,
} from "@/lib/iiif-normalizers";
import { getSampleIIIFResource } from "@/lib/sample-iiif";

export async function parseIIIFCollection(collectionUrl: string): Promise<NormalizedIIIFCollection> {
  const collection = await fetchIIIFJson<IIIFCollection>(collectionUrl);
  const manifestReferences = getCollectionManifestItems(collection);
  const manifests = await Promise.all(
    manifestReferences.map(async (reference) => {
      const manifestUrl = getManifestId(reference);

      if (!manifestUrl) {
        return normalizeManifest(reference);
      }

      try {
        const manifest = await fetchIIIFJson<IIIFManifest>(manifestUrl);
        return normalizeManifest(manifest, reference);
      } catch {
        return normalizeManifest(reference);
      }
    }),
  );

  return {
    id: getResourceId(collection) ?? collectionUrl,
    title: getText(collection.label, "Untitled collection"),
    source: collectionUrl,
    manifests,
  };
}

export function normalizeManifest(
  manifest: IIIFManifest | IIIFCollectionItem,
  fallback?: IIIFCollectionItem,
): NormalizedIIIFManifest {
  const id = getManifestId(manifest) ?? (fallback ? getManifestId(fallback) : undefined) ?? "";

  return {
    id,
    title: getManifestTitle(manifest, fallback),
    description: getManifestDescription(manifest, fallback),
    thumbnail: getManifestThumbnail(manifest) ?? getManifestThumbnail(fallback),
    metadata: normalizeMetadata(manifest.metadata),
    source: getManifestSource(manifest, fallback),
  };
}

async function fetchIIIFJson<T>(url: string): Promise<T> {
  const sampleResource = getSampleIIIFResource(url);

  if (sampleResource) {
    return sampleResource as T;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/ld+json, application/json",
    },
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch IIIF resource (${response.status}) from ${url}`);
  }

  return response.json() as Promise<T>;
}
