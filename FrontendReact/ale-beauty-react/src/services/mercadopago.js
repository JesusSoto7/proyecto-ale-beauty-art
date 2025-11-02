export async function fetchPseBanks({ baseUrl, token }) {
  const res = await fetch(`${baseUrl}/api/v1/mercadopago/pse_banks`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // si tu API lo requiere
    },
  });
  if (!res.ok) throw new Error("No se pudieron obtener bancos PSE");
  return res.json(); // [{ id: "1040", description: "Banco Agrario" }, ...]
}