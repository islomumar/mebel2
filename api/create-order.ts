import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface OrderRequest {
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  products: OrderProduct[];
  totalAmount?: number;
}

interface ValidatedProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

async function validateAndCalculatePrices(supabase: any, products: OrderProduct[]) {
  const errors: string[] = [];
  const validatedProducts: ValidatedProduct[] = [];
  let calculatedTotal = 0;

  const ids = products.map(p => p.id);
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, in_stock, stock_quantity, is_active, image_url")
    .in("id", ids);

  if (error) {
    return { validatedProducts: [], calculatedTotal: 0, errors: ["DB error"] };
  }

  const map = new Map((data || []).map((p: any) => [p.id, p]));

  for (const cp of products) {
    const db = map.get(cp.id);
    if (!db) { errors.push(`Not found: ${cp.name}`); continue; }
    if (!db.is_active) { errors.push(`Inactive: ${db.name}`); continue; }
    if (!db.in_stock || (db.stock_quantity !== null && db.stock_quantity < cp.quantity)) {
      errors.push(`Out of stock: ${db.name}`); continue;
    }
    if (cp.quantity <= 0) { errors.push(`Bad qty: ${db.name}`); continue; }

    calculatedTotal += db.price * cp.quantity;
    validatedProducts.push({
      id: db.id, name: db.name, price: db.price, quantity: cp.quantity, image_url: db.image_url
    });
  }

  return { validatedProducts, calculatedTotal, errors };
}

async function updateProductStock(supabase: any, products: ValidatedProduct[]) {
  for (const p of products) {
    const { data } = await supabase.from("products").select("stock_quantity").eq("id", p.id).single();
    const newQty = Math.max(0, (data?.stock_quantity || 0) - p.quantity);
    await supabase.from("products").update({ stock_quantity: newQty, in_stock: newQty > 0 }).eq("id", p.id);
    await supabase.from("stock_history").insert({ product_id: p.id, change: -p.quantity, type: "sale", notes: "Order sale" });
  }
}

async function sendTelegram(order: any, products: ValidatedProduct[]) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  const list = products.map(p => `• ${p.name} × ${p.quantity}`).join("\n");
  const msg = `New order\n${order.id}\n${list}\nTotal: ${order.total_amount}`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: msg })
  });
}

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body: OrderRequest = req.body;
    if (!body.customerName || !body.phone || !body.address || !Array.isArray(body.products)) {
      return res.status(400).json({ error: "Bad input" });
    }

    const { validatedProducts, calculatedTotal, errors } =
      await validateAndCalculatePrices(supabase, body.products);

    if (errors.length) return res.status(400).json({ error: errors });

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: body.customerName,
        phone: body.phone,
        address: body.address,
        notes: body.notes || null,
        products: validatedProducts,
        total_amount: calculatedTotal,
        status: "pending",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: "Insert failed" });

    await updateProductStock(supabase, validatedProducts);
    await sendTelegram(order, validatedProducts);

    return res.status(200).json({ success: true, orderId: order.id, totalAmount: calculatedTotal });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
