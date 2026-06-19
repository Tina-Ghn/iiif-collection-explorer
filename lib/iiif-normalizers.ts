import type {
  IIIFCollection,
  IIIFCollectionItem,
  IIIFLinkedResource,
  IIIFManifest,
  IIIFMetadataItem,
  IIIFProvider,
  IIIFResource,
  IIIFTextValue,
} from "@/lib/iiif-types";

type ManifestLike = IIIFManifest | IIIFCollectionItem;

export function getCollectionManifestItems(collection: IIIFCollection): IIIFCollectionItem[] {
  return (collection.items ?? collection.manifests ?? []).filter((item) => {
    const type = item.type ?? item["@type"];
    return Boolean(getResourceId(item) && type?.includes("Manifest"));
  });
}

export function getManifestId(manifest: ManifestLike): string | undefined {
  return getResourceId(manifest);
}

export function getManifestTitle(manifest: ManifestLike, fallback?: ManifestLike): string {
  return getText(manifest.label ?? fallback?.label, "Untitled item");
}

export function getManifestDescription(manifest: ManifestLike, fallback?: ManifestLike): string {
  return getText(manifest.summary ?? manifest.description ?? fallback?.summary ?? fallback?.description, "No description available.");
}

export function getManifestSource(manifest: ManifestLike, fallback?: ManifestLike): string {
  const id = getManifestId(manifest) ?? getManifestId(fallback) ?? "";

  return (
    getFirstResourceId(manifest.homepage) ??
    getFirstResourceId(fallback?.homepage) ??
    getFirstResourceId(manifest.related) ??
    getFirstResourceId(fallback?.related) ??
    getFirstResourceId(manifest.rendering) ??
    getFirstResourceId(fallback?.rendering) ??
    id
  );
}

export function getManifestInstitution(manifest: ManifestLike): string {
  return (
    getProviderLabel(manifest.provider) ??
    getMetadataValue(manifest.metadata, "institution") ??
    getMetadataValue(manifest.metadata, "repository") ??
    getText(manifest.requiredStatement?.value) ??
    getText(manifest.attribution) ??
    "Unknown institution"
  );
}

export function getManifestImageUrl(manifest: IIIFManifest): string | undefined {
  const firstCanvas = manifest.items?.[0];
  const firstAnnotationPage = firstCanvas?.items?.[0];
  const firstAnnotation = firstAnnotationPage?.items?.[0];
  const body = Array.isArray(firstAnnotation?.body) ? firstAnnotation.body[0] : firstAnnotation?.body;
  const v2Image = manifest.sequences?.[0]?.canvases?.[0]?.images?.[0]?.resource;

  return getResourceId(body) ?? getResourceId(v2Image) ?? getFirstResourceId(manifest.thumbnail);
}

export function getManifestThumbnail(manifest?: ManifestLike): string | undefined {
  if (!manifest) {
    return undefined;
  }

  if ("items" in manifest || "sequences" in manifest) {
    return getManifestImageUrl(manifest);
  }

  return getFirstResourceId(manifest.thumbnail);
}

export function normalizeMetadata(metadata: IIIFMetadataItem[] = []): Array<{ label: string; value: string }> {
  return metadata
    .map((item) => ({
      label: getText(item.label, "Metadata"),
      value: getText(item.value),
    }))
    .filter((item) => item.label || item.value);
}

export function getMetadataValue(metadata: IIIFMetadataItem[] = [], key: string): string | undefined {
  const match = metadata.find((item) => getText(item.label).toLowerCase() === key.toLowerCase());

  if (!match) {
    return undefined;
  }

  return getText(match.value);
}

export function getProviderLabel(providers: IIIFProvider[] = []): string | undefined {
  return providers.map((provider) => getText(provider.label)).find(Boolean);
}

export function getResourceId(resource?: IIIFResource | string): string | undefined {
  if (!resource) {
    return undefined;
  }

  if (typeof resource === "string") {
    return resource;
  }

  return resource.id ?? resource["@id"];
}

export function getFirstResourceId(resource?: IIIFLinkedResource): string | undefined {
  if (Array.isArray(resource)) {
    return getResourceId(resource[0]);
  }

  return getResourceId(resource);
}

export function getText(value: IIIFTextValue | undefined, fallback = ""): string {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    return stripHtml(value) || fallback;
  }

  if (Array.isArray(value)) {
    const preferredValues = getPreferredLanguageTaggedValues(value);
    return preferredValues.map(toText).filter(Boolean).join(", ") || fallback;
  }

  if ("@value" in value || "value" in value) {
    return toText(value) || fallback;
  }

  const languageValues = value.none ?? value.de ?? value.en ?? Object.values(value)[0] ?? [];
  return languageValues.map(toText).filter(Boolean).join(", ") || fallback;
}

function getPreferredLanguageTaggedValues<T>(values: T[]): T[] {
  const languageTaggedValues = values.filter(
    (value): value is T & { "@language"?: string } => typeof value === "object" && value !== null && "@value" in value,
  );

  if (languageTaggedValues.length === 0) {
    return values;
  }

  const germanValues = languageTaggedValues.filter((value) => value["@language"] === "de");
  const englishValues = languageTaggedValues.filter((value) => value["@language"] === "en");

  if (germanValues.length > 0) {
    return germanValues;
  }

  if (englishValues.length > 0) {
    return englishValues;
  }

  return languageTaggedValues;
}

function toText(value: string | { "@value"?: string; value?: string }): string {
  if (typeof value === "string") {
    return stripHtml(value);
  }

  return stripHtml(value["@value"] ?? value.value ?? "");
}

function stripHtml(value: unknown): string {
  return String(value).replace(/<[^>]*>/g, "").trim();
}
