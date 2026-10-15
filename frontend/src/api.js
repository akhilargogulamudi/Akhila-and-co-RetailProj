export async function request(path, options = {}) {
  const r = await fetch("/api" + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  let data;
  try {
    data = await r.json();
  } catch {
    throw Error("The shop service is unavailable. Please try again.");
  }
  if (!r.ok)
    throw Error(
      data.message || data.detail || "We could not complete your request.",
    );
  return data;
}
