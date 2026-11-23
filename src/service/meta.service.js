import { createHash } from "node:crypto";

// Meta Conversions API. O Purchase sai do servidor porque só ele sabe que o Asaas confirmou o pagamento
// (o navegador não garante que a pessoa volte ao site depois de pagar). Sem META_PIXEL_ID ou META_CAPI_TOKEN não envia.
const sha256 = (value) => createHash("sha256").update(String(value).trim().toLowerCase()).digest("hex");

export const sendPurchase = async ({ email, paymentId, value }) => {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return;
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: token,
        data: [{
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: `purchase:${paymentId}`, // mesmo id reenviado pelo Asaas não vira outra compra no Meta
          action_source: "website",
          user_data: { em: [sha256(email)] },
          custom_data: { value: Number(value) || 0, currency: "BRL" },
        }],
      }),
    });
    if (!res.ok) console.error("meta capi:", res.status, await res.text());
  } catch (error) {
    console.error("meta capi:", error.message); // não pode derrubar o webhook: senão o Asaas reenvia
  }
};
