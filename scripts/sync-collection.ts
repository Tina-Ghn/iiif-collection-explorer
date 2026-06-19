import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type {
  IIIFV2Collection,
  IIIFV2Manifest,
  IIIFV2ManifestReference,
  IIIFV2Metadata,
  IIIFV2TextValue,
  MuseumCollection,
  MuseumCollectionCache,
  MuseumObject,
  MuseumObjectMetadata,
} from "../lib/types.ts";

const COLLECTION_URL =
  process.env.IIIF_COLLECTION_URL ?? "https://brandenburg.museum-digital.de/apis/iiif-presentation/collection/c217";
const OUTPUT_PATH = path.join(process.cwd(), "data", "museum-objects.json");
const REQUEST_HEADERS = {
  Accept: "application/ld+json, application/json",
  "Accept-Language": "de,en;q=0.9",
  "User-Agent": "Mozilla/5.0 IIIF Collection Explorer",
};

async function syncCollection() {
  const generatedAt = new Date().toISOString();
  const collection = await fetchJson<IIIFV2Collection>(COLLECTION_URL);
  const objects = await syncManifests(collection, generatedAt);
  const normalizedCollection: MuseumCollection = {
    id: collection["@id"],
    sourceUrl: collection["@id"],
    title: collection.label,
    generatedAt,
    objects,
    stats: getCollectionStats(objects),
  };
  const cache: MuseumCollectionCache = {
    generatedAt,
    sourceUrl: collection["@id"],
    collection: normalizedCollection,
    complete: true,
  };

  await writeCache(cache);

  console.log(`Synced ${objects.length} objects to ${OUTPUT_PATH}`);
  console.log(`Generated at ${generatedAt}`);
}

async function syncManifests(collection: IIIFV2Collection, generatedAt: string): Promise<MuseumObject[]> {
  const objects: MuseumObject[] = [];

  for (let index = 0; index < collection.manifests.length; index += 3) {
    const batch = collection.manifests.slice(index, index + 3);
    objects.push(...(await Promise.all(batch.map(syncManifestReference))));

    await writeCache({
      generatedAt,
      sourceUrl: collection["@id"],
      complete: false,
      collection: {
        id: collection["@id"],
        sourceUrl: collection["@id"],
        title: collection.label,
        generatedAt,
        objects,
        stats: getCollectionStats(objects),
      },
    });

    console.log(`Synced ${Math.min(index + 3, collection.manifests.length)} / ${collection.manifests.length}`);
  }

  return objects;
}

async function writeCache(cache: MuseumCollectionCache) {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

async function syncManifestReference(reference: IIIFV2ManifestReference): Promise<MuseumObject> {
  try {
    const manifest = await fetchJsonWithRetry<IIIFV2Manifest>(reference["@id"]);
    const object = parseManifest(manifest);

    return {
      ...object,
      imageUrl: await getBestImageUrl(object.imageService, object.thumbnail),
    };
  } catch (error) {
    console.warn(`Could not sync manifest: ${reference.label} (${reference["@id"]})`, error);

    return {
      id: reference["@id"],
      detailId: encodeManifestId(reference["@id"]),
      sourceUrl: reference["@id"],
      title: reference.label || "Untitled object",
      metadata: [],
    };
  }
}

function parseManifest(manifest: IIIFV2Manifest): MuseumObject {
  const creator = getMetadataValueByLabel(manifest.metadata, "gemalt von");
  const date = getMetadataValueByLabel(manifest.metadata, "gemalt");

  return {
    id: manifest["@id"],
    detailId: encodeManifestId(manifest["@id"]),
    sourceUrl: manifest["@id"],
    title: getText(manifest.label, "Untitled object"),
    description: getText(manifest.description),
    creator,
    date,
    thumbnail: manifest.thumbnail?.["@id"],
    imageService: manifest.thumbnail?.service?.["@id"],
    metadata: normalizeMetadata(manifest.metadata),
  };
}

async function getBestImageUrl(imageService?: string, thumbnail?: string): Promise<string | undefined> {
  if (!imageService) {
    return thumbnail;
  }

  const candidates = [
    `${imageService}/full/max/0/default.jpg`,
    `${imageService}/full/3000,/0/default.jpg`,
    `${imageService}/full/2000,/0/default.jpg`,
    `${imageService}/full/1000,/0/default.jpg`,
    thumbnail,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate && (await isImageAvailable(candidate))) {
      return candidate;
    }
  }

  return thumbnail;
}

async function isImageAvailable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": REQUEST_HEADERS["User-Agent"],
      },
    });

    return Boolean(response.headers.get("content-type")?.startsWith("image/"));
  } catch {
    return false;
  }
}

async function fetchJsonWithRetry<T>(url: string, retries = 5): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchJson<T>(url);
    } catch (error) {
      lastError = error;
      await delay(750 * (attempt + 1));
    }
  }

  throw lastError;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeMetadata(metadata: IIIFV2Metadata[] = []): MuseumObjectMetadata[] {
  return metadata
    .map((item) => ({
      label: getText(item.label),
      value: getText(item.value),
    }))
    .filter((item) => item.label || item.value);
}

function getMetadataValueByLabel(metadata: IIIFV2Metadata[] = [], label: string): string | undefined {
  const item = metadata.find((entry) => getText(entry.label).toLowerCase() === label.toLowerCase());
  const value = item ? getText(item.value) : "";

  return value || undefined;
}

function getText(value: IIIFV2TextValue | undefined, fallback = ""): string {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    return stripHtml(value) || fallback;
  }

  const preferredValue =
    value.find((item) => item["@language"] === "de") ??
    value.find((item) => item["@language"] === "en") ??
    value[0];

  return stripHtml(preferredValue?.["@value"] ?? "") || fallback;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

function getCollectionStats(objects: MuseumObject[]): MuseumCollection["stats"] {
  const years = objects.flatMap((object) => {
    const year = object.date?.match(/\b(\d{3,4})\b/)?.[1];
    return year ? [Number(year)] : [];
  });
  const artists = new Set(objects.map((object) => object.creator).filter(Boolean));

  return {
    totalObjects: objects.length,
    earliestYear: years.length > 0 ? Math.min(...years) : undefined,
    latestYear: years.length > 0 ? Math.max(...years) : undefined,
    uniqueArtists: artists.size,
  };
}

function encodeManifestId(id: string): string {
  return Buffer.from(id, "utf8").toString("base64url");
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

void syncCollection().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
