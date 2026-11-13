import { runNexarQuery } from "./nexarClient.js";
import { normalizeNexarPart } from "./componentNormalizer.js";

export async function searchComponentsByMpn(searchTerm, limit = 10) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 20);
  const escapedTerm = searchTerm.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

  // Keep this query deliberately small for the first integration milestone.
  const query = `
    query SearchComponents {
      supSearchMpn(q: "${escapedTerm}", limit: ${safeLimit}) {
        hits
        results {
          part {
            mpn
            manufacturer { name }
          }
        }
      }
    }
  `;

  const data = await runNexarQuery(query);
  const search = data?.supSearchMpn;
  return {
    totalMatches: search?.hits ?? 0,
    results: (search?.results || []).map(normalizeNexarPart).filter(Boolean),
    source: "Nexar / Octopart",
    retrievedAt: new Date().toISOString()
  };
}
