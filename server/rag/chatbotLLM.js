// server/rag/chatbotLLM.js
module.exports.generateFinalAnswer = async function ({ query, intent, context }) {
  if (context.type === "product") {
    let txt = "Here are some products I found:\n";
    context.items.forEach((p, i) => {
      txt += `\n${i + 1}) ${p.title} — ₹${p.price}\n   ${p.description.slice(0, 80)}...\n`;
    });
    return txt;
  }

  if (context.type === "order") {
    if (context.items.length === 0) return "You have no recent orders.";
    const o = context.items[0];
    return `Your latest order #${o._id} of ₹${o.totalAmount} is currently being processed.`;
  }

  if (context.type === "user") {
    const u = context.items[0];
    return `Your account: ${u.name}, Email: ${u.email}, Address: ${u.address}`;
  }

  return "I'm here to help you with products, orders, or account details. Ask me anything!";
};
