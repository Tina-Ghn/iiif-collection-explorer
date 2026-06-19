export type IIIFLanguageMap = Record<string, string[]>;
export interface IIIFLanguageTaggedValue {
  "@language"?: string;
  "@value"?: string;
  value?: string;
}
export type IIIFTextValue = string | Array<string | IIIFLanguageTaggedValue> | IIIFLanguageMap | IIIFLanguageTaggedValue;
export type IIIFLinkedResource = string | IIIFResource | IIIFResource[];

export interface IIIFResource {
  id?: string;
  "@id"?: string;
  type?: string;
  "@type"?: string;
  format?: string;
  label?: IIIFTextValue;
  service?: IIIFResource | IIIFResource[];
}

export interface IIIFMetadataItem {
  label: IIIFTextValue;
  value: IIIFTextValue;
}

export interface IIIFProvider {
  id?: string;
  type?: string;
  label?: IIIFTextValue;
  homepage?: IIIFLinkedResource;
}

export interface IIIFCanvas extends IIIFResource {
  height?: number;
  width?: number;
  items?: Array<{
    id?: string;
    type?: string;
    items?: Array<{
      id?: string;
      type?: string;
      body?: IIIFResource | IIIFResource[];
    }>;
  }>;
  images?: Array<{
    resource?: IIIFResource;
  }>;
}

export interface IIIFManifest extends IIIFResource {
  id?: string;
  type?: "Manifest" | string;
  label?: IIIFTextValue;
  metadata?: IIIFMetadataItem[];
  summary?: IIIFTextValue;
  description?: IIIFTextValue;
  thumbnail?: IIIFLinkedResource;
  homepage?: IIIFLinkedResource;
  related?: IIIFLinkedResource;
  rendering?: IIIFLinkedResource;
  attribution?: IIIFTextValue;
  provider?: IIIFProvider[];
  requiredStatement?: IIIFMetadataItem;
  items?: IIIFCanvas[];
  sequences?: Array<{
    canvases?: IIIFCanvas[];
  }>;
  seeAlso?: IIIFResource[];
}

export interface IIIFCollectionItem extends IIIFResource {
  id?: string;
  type?: "Manifest" | "Collection" | string;
  label?: IIIFTextValue;
  metadata?: IIIFMetadataItem[];
  summary?: IIIFTextValue;
  description?: IIIFTextValue;
  thumbnail?: IIIFLinkedResource;
  homepage?: IIIFLinkedResource;
  related?: IIIFLinkedResource;
  rendering?: IIIFLinkedResource;
  attribution?: IIIFTextValue;
  provider?: IIIFProvider[];
  requiredStatement?: IIIFMetadataItem;
}

export interface IIIFCollection extends IIIFResource {
  id?: string;
  type?: "Collection" | string;
  label?: IIIFTextValue;
  summary?: IIIFTextValue;
  description?: IIIFTextValue;
  items?: IIIFCollectionItem[];
  manifests?: IIIFCollectionItem[];
}

export interface CollectionListItem {
  id: string;
  detailId: string;
  title: string;
  institution: string;
  thumbnailUrl?: string;
}

export interface ManifestDetail {
  id: string;
  title: string;
  institution: string;
  imageUrl?: string;
  metadata: Array<{
    label: string;
    value: string;
  }>;
  description: string;
  sourceUrl: string;
}

export interface NormalizedIIIFMetadataItem {
  label: string;
  value: string;
}

export interface NormalizedIIIFManifest {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  metadata: NormalizedIIIFMetadataItem[];
  source: string;
}

export interface NormalizedIIIFCollection {
  id: string;
  title: string;
  source: string;
  manifests: NormalizedIIIFManifest[];
}
