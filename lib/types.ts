export interface IIIFV2LanguageTaggedValue {
  "@language"?: string;
  "@value": string;
}

export type IIIFV2TextValue = string | IIIFV2LanguageTaggedValue[];

export interface IIIFV2ImageService {
  "@context"?: string;
  "@id": string;
  profile?: string;
}

export interface IIIFV2Thumbnail {
  "@id": string;
  service?: IIIFV2ImageService;
}

export interface IIIFV2Metadata {
  label: IIIFV2TextValue;
  value: IIIFV2TextValue;
}

export interface IIIFV2ManifestReference {
  "@id": string;
  "@type": "sc:Manifest" | string;
  label: string;
}

export interface IIIFV2Collection {
  "@context": string;
  "@id": string;
  "@type": "sc:Collection" | string;
  label: string;
  description?: string;
  attribution?: string;
  manifests: IIIFV2ManifestReference[];
}

export interface IIIFV2Manifest {
  "@context"?: string;
  "@id": string;
  "@type": "sc:Manifest" | string;
  label: IIIFV2TextValue;
  description?: IIIFV2TextValue;
  metadata?: IIIFV2Metadata[];
  thumbnail?: IIIFV2Thumbnail;
  attribution?: string;
}

export interface MuseumObject {
  id: string;
  detailId: string;
  sourceUrl: string;
  title: string;
  description?: string;
  creator?: string;
  date?: string;
  thumbnail?: string;
  imageService?: string;
  imageUrl?: string;
  metadata: MuseumObjectMetadata[];
}

export interface MuseumObjectMetadata {
  label: string;
  value: string;
}

export interface MuseumCollectionStats {
  totalObjects: number;
  earliestYear?: number;
  latestYear?: number;
  uniqueArtists: number;
}

export interface MuseumCollection {
  id: string;
  sourceUrl: string;
  title: string;
  generatedAt: string;
  objects: MuseumObject[];
  stats: MuseumCollectionStats;
}

export interface MuseumCollectionCache {
  generatedAt: string;
  sourceUrl: string;
  collection: MuseumCollection;
  complete?: boolean;
}
