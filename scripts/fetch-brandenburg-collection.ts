const COLLECTION_URL = "https://brandenburg.museum-digital.de/apis/iiif-presentation/collection/c217";
const DEFAULT_MANIFEST_LIMIT = 5;

interface LanguageTaggedValue {
  "@language"?: string;
  "@value": string;
}

type TextValue = string | LanguageTaggedValue[] | Record<string, string[]>;

interface Metadata {
  label: TextValue;
  value: TextValue;
}

interface ManifestReference {
  "@id": string;
  "@type": "sc:Manifest" | string;
  label: string;
}

interface Collection {
  "@context": string;
  "@id": string;
  "@type": "sc:Collection" | string;
  label: string;
  viewingHint?: string;
  description?: string;
  attribution?: string;
  manifests: ManifestReference[];
}

interface Manifest {
  "@id": string;
  "@type": "sc:Manifest" | string;
  label: string;
  description?: string;
  metadata?: Metadata[];
  thumbnail?: {
    "@id"?: string;
  };
  attribution?: string;
}

interface NormalizedMetadata {
  label: string;
  value: string;
}

interface NormalizedManifestReference {
  id: string;
  type: string;
  title: string;
  metadata: NormalizedMetadata[];
}

interface NormalizedCollection {
  id: string;
  type: string;
  title: string;
  description: string;
  attribution: string;
  manifestCount: number;
  manifests: NormalizedManifestReference[];
}

export async function fetchBrandenburgCollection(
  manifestLimit = DEFAULT_MANIFEST_LIMIT,
): Promise<NormalizedCollection> {
  const collection = await fetchJson<Collection>(COLLECTION_URL);
  const manifestReferences = collection.manifests.slice(0, manifestLimit);
  const manifests = await Promise.all(
    manifestReferences.map(async (reference) => {
      const manifest = await fetchJson<Manifest>(reference["@id"]);

      return {
        id: reference["@id"],
        type: reference["@type"],
        title: reference.label,
        metadata: normalizeMetadata(manifest.metadata),
      };
    }),
  );

  return {
    id: collection["@id"],
    type: collection["@type"],
    title: collection.label,
    description: stripHtml(collection.description ?? ""),
    attribution: stripHtml(collection.attribution ?? ""),
    manifestCount: collection.manifests.length,
    manifests,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, application/ld+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function normalizeMetadata(metadata: Metadata[] = []): NormalizedMetadata[] {
  return metadata.map((item) => ({
    label: normalizeText(item.label),
    value: normalizeText(item.value),
  }));
}

function normalizeText(value: TextValue): string {
  if (typeof value === "string") {
    return stripHtml(value);
  }

  if (Array.isArray(value)) {
    const preferredValue =
      value.find((item) => item["@language"] === "de") ??
      value.find((item) => item["@language"] === "en") ??
      value[0];

    return stripHtml(preferredValue?.["@value"] ?? "");
  }

  const languageValues = value.de ?? value.en ?? value.none ?? Object.values(value)[0] ?? [];
  return languageValues.map(stripHtml).join(", ");
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

async function main() {
  const normalizedCollection = await fetchBrandenburgCollection();
  console.log(JSON.stringify(normalizedCollection, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
