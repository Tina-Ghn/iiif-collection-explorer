import { encodeManifestId } from "@/lib/routes";
import { readFile } from "fs/promises";
import { constants } from "fs";
import { access } from "fs/promises";
import path from "path";
import { cache } from "react";
import type {
  CollectionListItem,
  IIIFCollection,
  IIIFManifest,
  ManifestDetail,
} from "@/lib/iiif-types";
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
} from "@/lib/types";
import {
  getCollectionManifestItems,
  getFirstResourceId,
  getManifestDescription,
  getManifestId,
  getManifestImageUrl,
  getManifestInstitution,
  getManifestSource,
  getManifestTitle,
  normalizeMetadata,
} from "@/lib/iiif-normalizers";
import { getSampleIIIFResource, SAMPLE_COLLECTION_URL } from "@/lib/sample-iiif";

const DEFAULT_COLLECTION_URL = SAMPLE_COLLECTION_URL;
const CACHE_PATH = path.join(process.cwd(), "data", "museum-objects.json");

export class MuseumCollectionCacheMissingError extends Error {
  constructor() {
    super("Museum collection cache is missing. Run `npm run sync-collection` to generate data/museum-objects.json.");
    this.name = "MuseumCollectionCacheMissingError";
  }
}

export function getCollectionUrl(): string {
  return process.env.IIIF_COLLECTION_URL ?? DEFAULT_COLLECTION_URL;
}

export async function fetchIIIFCollection(): Promise<IIIFCollection> {
  return fetchIIIFJson<IIIFCollection>(getCollectionUrl());
}

export async function fetchIIIFManifest(id: string): Promise<IIIFManifest> {
  return fetchIIIFJson<IIIFManifest>(id);
}

export const fetchMuseumCollection = cache(async (): Promise<MuseumCollection> => {
  const cacheData = await readMuseumCollectionCache();
  return cacheData.collection;
});

export async function fetchMuseumGalleryItems(): Promise<MuseumObject[]> {
  const collection = await fetchMuseumCollection();
  return collection.objects;
}

export async function getMuseumObjectByDetailId(detailId: string): Promise<MuseumObject | undefined> {
  const collection = await fetchMuseumCollection();
  return collection.objects.find((object) => object.detailId === detailId);
}

async function readMuseumCollectionCache(): Promise<MuseumCollectionCache> {
  try {
    await access(CACHE_PATH, constants.R_OK);
  } catch {
    throw new MuseumCollectionCacheMissingError();
  }

  const cacheFile = await readFile(CACHE_PATH, "utf8");
  return JSON.parse(cacheFile) as MuseumCollectionCache;
}

export function parseManifest(manifest: IIIFV2Manifest): MuseumObject {
  const creator = getMetadataValueByLabel(manifest.metadata, "gemalt von");
  const date = getMetadataValueByLabel(manifest.metadata, "gemalt");

  return {
    id: manifest["@id"],
    detailId: encodeManifestId(manifest["@id"]),
    sourceUrl: manifest["@id"],
    title: getV2Text(manifest.label, "Untitled object"),
    description: getV2Text(manifest.description),
    creator,
    date,
    thumbnail: manifest.thumbnail?.["@id"],
    imageService: manifest.thumbnail?.service?.["@id"],
    metadata: normalizeV2Metadata(manifest.metadata),
  };
}

export function getLargeImageUrl(imageService: string): string {
  return `${imageService}/full/max/0/default.jpg`;
}

export function getLargeImageFallbackUrl(imageService: string): string {
  return `${imageService}/full/2000,/0/default.jpg`;
}

export async function getBestImageUrl(imageService?: string, thumbnail?: string): Promise<string | undefined> {
  if (!imageService) {
    return thumbnail;
  }

  const candidates = [
    getLargeImageUrl(imageService),
    getSizedImageUrl(imageService, 3000),
    getLargeImageFallbackUrl(imageService),
    getSizedImageUrl(imageService, 1000),
    thumbnail,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate && (await isImageAvailable(candidate))) {
      return candidate;
    }
  }

  return thumbnail;
}

export function withResolvedImageUrl(object: MuseumObject, imageUrl?: string): MuseumObject {
  return {
    ...object,
    imageUrl,
  };
}

function getSizedImageUrl(imageService: string, width: number): string {
  return `${imageService}/full/${width},/0/default.jpg`;
}

async function parseManifestReference(reference: IIIFV2ManifestReference): Promise<MuseumObject> {
  try {
    const manifest = await fetchV2Manifest(reference["@id"]);
    return parseManifest(manifest);
  } catch {
    return {
      id: reference["@id"],
      detailId: encodeManifestId(reference["@id"]),
      sourceUrl: reference["@id"],
      title: reference.label || "Untitled object",
      metadata: [],
    };
  }
}

const fetchV2Manifest = cache(async (url: string): Promise<IIIFV2Manifest> => fetchV2ManifestWithRetry(url));

async function fetchV2ManifestWithRetry(url: string, retries = 4): Promise<IIIFV2Manifest> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchIIIFJson<IIIFV2Manifest>(url);
    } catch (error) {
      lastError = error;
      await delay(500 * (attempt + 1));
    }
  }

  throw lastError;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  for (let index = 0; index < items.length; index += concurrency) {
    const batch = items.slice(index, index + concurrency);
    results.push(...(await Promise.all(batch.map(mapper))));
  }

  return results;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isImageAvailable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      cache: "force-cache",
    });

    return Boolean(response.headers.get("content-type")?.startsWith("image/"));
  } catch {
    return false;
  }
}

function getCollectionStats(objects: MuseumObject[]): MuseumCollection["stats"] {
  const years = objects.flatMap((object) => {
    const year = getFirstYear(object.date);
    return year ? [year] : [];
  });
  const artists = new Set(objects.map((object) => object.creator).filter(Boolean));

  return {
    totalObjects: objects.length,
    earliestYear: years.length > 0 ? Math.min(...years) : undefined,
    latestYear: years.length > 0 ? Math.max(...years) : undefined,
    uniqueArtists: artists.size,
  };
}

function getFirstYear(value?: string): number | undefined {
  const match = value?.match(/\b(\d{3,4})\b/);

  if (!match) {
    return undefined;
  }

  return Number(match[1]);
}

export function toCollectionListItems(collection: IIIFCollection): CollectionListItem[] {
  return getCollectionManifestItems(collection).flatMap((item) => {
    const itemId = getManifestId(item);

    if (!itemId) {
      return [];
    }

    return {
      id: itemId,
      detailId: encodeManifestId(itemId),
      title: getManifestTitle(item),
      institution: getManifestInstitution(item),
      thumbnailUrl: getFirstResourceId(item.thumbnail),
    };
  });
}

export function toManifestDetail(manifest: IIIFManifest): ManifestDetail {
  const manifestId = getManifestId(manifest) ?? "";

  return {
    id: manifestId,
    title: getManifestTitle(manifest),
    institution: getManifestInstitution(manifest),
    imageUrl: getManifestImageUrl(manifest),
    metadata: normalizeMetadata(manifest.metadata),
    description: getManifestDescription(manifest),
    sourceUrl: getManifestSource(manifest),
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
      "Accept-Language": "de,en;q=0.9",
      "User-Agent": "Mozilla/5.0 IIIF Collection Explorer",
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

function getMetadataValueByLabel(metadata: IIIFV2Metadata[] = [], label: string): string | undefined {
  const item = metadata.find((entry) => getV2Text(entry.label).toLowerCase() === label.toLowerCase());

  if (!item) {
    return undefined;
  }

  const value = getV2Text(item.value);
  return value || undefined;
}

function normalizeV2Metadata(metadata: IIIFV2Metadata[] = []): MuseumObjectMetadata[] {
  return metadata
    .map((item) => ({
      label: getV2Text(item.label),
      value: getV2Text(item.value),
    }))
    .filter((item) => item.label || item.value);
}

function getV2Text(value: IIIFV2TextValue | undefined, fallback = ""): string {
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
