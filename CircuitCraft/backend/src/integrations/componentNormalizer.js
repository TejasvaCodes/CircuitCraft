export function normalizeNexarPart(result) {
  const part = result?.part;
  if (!part) return null;

  return {
    manufacturerPartNumber: part.mpn || "Unknown MPN",
    manufacturer: part.manufacturer?.name || "Unknown manufacturer",
    source: "Nexar / Octopart"
  };
}
