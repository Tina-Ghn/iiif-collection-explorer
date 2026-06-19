export function encodeManifestId(id: string): string {
  return Buffer.from(id, "utf8").toString("base64url");
}

export function decodeManifestId(id: string): string {
  return Buffer.from(id, "base64url").toString("utf8");
}
