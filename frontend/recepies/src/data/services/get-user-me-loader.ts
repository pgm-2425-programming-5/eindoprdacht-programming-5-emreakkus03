import { getAuthToken } from "./get-token";


export async function getUserMeLoader(jwt?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
  const url = new URL("/api/users/me", baseUrl);

  if (!jwt) return { ok: false, data: null, error: null };

  try {
    const response = await fetch(url.href, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await response.json();
    if (data.error) return { ok: false, data: null, error: data.error };
    return { ok: true, data, error: null };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null, error };
  }
}
