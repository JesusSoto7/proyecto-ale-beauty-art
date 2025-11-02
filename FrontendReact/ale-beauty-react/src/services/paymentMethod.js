export async function getPaymentMethods({ token, baseUrl }) {
  const res = await fetch(`${baseUrl}/api/v1/payment_methods`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("No se pudieron obtener los métodos de pago");
  return res.json();
}

export async function setOrderPaymentMethod({ token, baseUrl, orderId, codigo, id }) {
  const body = codigo ? { payment_method_codigo: codigo } : { payment_method_id: id };
  const res = await fetch(`${baseUrl}/api/v1/orders/${orderId}/set_payment_method`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "No se pudo asignar el método de pago");
  }
  return res.json();
}