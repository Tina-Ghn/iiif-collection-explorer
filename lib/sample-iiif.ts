import type { IIIFCollection, IIIFManifest } from "@/lib/iiif-types";

export const SAMPLE_COLLECTION_URL = "local:sample-collection";

const sampleManifestOne: IIIFManifest = {
  id: "local:sample-manifest-1",
  type: "Manifest",
  label: { en: ["Portrait of a Scholar"] },
  summary: {
    en: [
      "A study portrait presented as sample IIIF data for local development when public collection endpoints are unavailable.",
    ],
  },
  provider: [
    {
      id: "https://example.org/museum",
      type: "Agent",
      label: { en: ["Example Museum"] },
    },
  ],
  metadata: [
    { label: { en: ["Creator"] }, value: { en: ["Unknown artist"] } },
    { label: { en: ["Date"] }, value: { en: ["Late 19th century"] } },
    { label: { en: ["Medium"] }, value: { en: ["Oil on canvas"] } },
    { label: { en: ["Institution"] }, value: { en: ["Example Museum"] } },
  ],
  homepage: [
    {
      id: "https://example.org/objects/portrait-of-a-scholar",
      type: "Text",
      label: { en: ["Object record"] },
    },
  ],
  thumbnail: [
    {
      id: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?auto=format&fit=crop&w=800&q=80",
      type: "Image",
      format: "image/jpeg",
    },
  ],
  items: [
    {
      id: "local:sample-canvas-1",
      type: "Canvas",
      width: 1200,
      height: 1600,
      items: [
        {
          id: "local:sample-annotation-page-1",
          type: "AnnotationPage",
          items: [
            {
              id: "local:sample-annotation-1",
              type: "Annotation",
              body: {
                id: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?auto=format&fit=crop&w=1600&q=90",
                type: "Image",
                format: "image/jpeg",
              },
            },
          ],
        },
      ],
    },
  ],
};

const sampleManifestTwo: IIIFManifest = {
  id: "local:sample-manifest-2",
  type: "Manifest",
  label: { en: ["Ceramic Vessel"] },
  summary: {
    en: ["A locally bundled sample object with complete metadata, thumbnail, description, and source fields."],
  },
  provider: [
    {
      id: "https://example.org/archive",
      type: "Agent",
      label: { en: ["Example Cultural Archive"] },
    },
  ],
  metadata: [
    { label: { en: ["Culture"] }, value: { en: ["Sample collection"] } },
    { label: { en: ["Date"] }, value: { en: ["20th century"] } },
    { label: { en: ["Material"] }, value: { en: ["Glazed ceramic"] } },
    { label: { en: ["Institution"] }, value: { en: ["Example Cultural Archive"] } },
  ],
  homepage: [
    {
      id: "https://example.org/objects/ceramic-vessel",
      type: "Text",
      label: { en: ["Object record"] },
    },
  ],
  thumbnail: [
    {
      id: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
      type: "Image",
      format: "image/jpeg",
    },
  ],
  items: [
    {
      id: "local:sample-canvas-2",
      type: "Canvas",
      width: 1200,
      height: 1600,
      items: [
        {
          id: "local:sample-annotation-page-2",
          type: "AnnotationPage",
          items: [
            {
              id: "local:sample-annotation-2",
              type: "Annotation",
              body: {
                id: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1600&q=90",
                type: "Image",
                format: "image/jpeg",
              },
            },
          ],
        },
      ],
    },
  ],
};

const manifests = [sampleManifestOne, sampleManifestTwo];

export const sampleCollection: IIIFCollection = {
  id: SAMPLE_COLLECTION_URL,
  type: "Collection",
  label: { en: ["Local Sample IIIF Collection"] },
  summary: { en: ["A bundled IIIF Presentation API v3 collection for offline development."] },
  items: manifests.map((manifest) => ({
    id: manifest.id,
    type: "Manifest",
    label: manifest.label,
    summary: manifest.summary,
    thumbnail: manifest.thumbnail,
    provider: manifest.provider,
    metadata: manifest.metadata,
    homepage: manifest.homepage,
  })),
};

export function getSampleIIIFResource(url: string): IIIFCollection | IIIFManifest | undefined {
  if (url === SAMPLE_COLLECTION_URL) {
    return sampleCollection;
  }

  return manifests.find((manifest) => manifest.id === url);
}
