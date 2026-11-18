// IndexNow – azonnali értesítés Bing/Yandex/Seznam stb. felé, ha egy oldal tartalma változik.
// A kulcs NEM titok: a protokoll szerint nyilvánosan elérhető a /public/<kulcs>.txt fájlban.
// Kulcscsere esetén a public/ alatti fájlt is át kell nevezni.

export const INDEXNOW_KEY = "10bc2583039d32331bb439b73dedd48b";

const ENDPOINT = "https://api.indexnow.org/indexnow";

// Csak a canonical host — a www. 308-cal ide irányít át (Vercel domain beállítás).
const HOSTS = ["gammaapartmanok.hu"];

export const INDEXNOW_PATHS = ["/", "/galeria", "/foglalas"];

/** Beküldi a megadott útvonalakat (pl. ["/", "/galeria"]). Hibát nem dob, csak naplóz. */
export async function submitIndexNow(paths: string[] = INDEXNOW_PATHS) {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return [];

  return Promise.all(
    HOSTS.map(async (host) => {
      try {
        const res = await fetch(ENDPOINT, {
          method:  "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            host,
            key:         INDEXNOW_KEY,
            keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
            urlList:     paths.map((p) => `https://${host}${p === "/" ? "" : p}`),
          }),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) console.error(`[IndexNow] ${host}: HTTP ${res.status}`);
        return { host, status: res.status };
      } catch (err: any) {
        console.error(`[IndexNow] ${host}:`, err?.message);
        return { host, status: 0, error: err?.message as string };
      }
    }),
  );
}
