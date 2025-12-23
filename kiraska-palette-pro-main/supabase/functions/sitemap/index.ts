import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch domain from site_settings
    const { data: domainSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "sitemap_domain")
      .single();

    const baseUrl = domainSetting?.value || "https://kiraska.uz";

    // Fetch active languages from database
    const { data: languagesData } = await supabase
      .from("languages")
      .select("code")
      .eq("is_active", true)
      .order("position");

    const languages = languagesData?.map(l => l.code) || ["uz"];
    const defaultLang = "uz";

    // Fetch active categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("is_active", true);

    // Fetch active products
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);

    // Generate sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    // Helper to generate URL with hreflang alternates
    const generateUrl = (path: string, lastmod: string | null, priority: string, changefreq: string) => {
      let urlBlock = "";
      for (const lang of languages) {
        const langPrefix = lang === defaultLang ? "" : `/${lang}`;
        const fullUrl = `${baseUrl}${langPrefix}${path}`;
        const lastmodStr = lastmod ? new Date(lastmod).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
        
        urlBlock += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmodStr}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
`;
        // Add hreflang alternates
        for (const altLang of languages) {
          const altPrefix = altLang === defaultLang ? "" : `/${altLang}`;
          urlBlock += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}${altPrefix}${path}" />
`;
        }
        urlBlock += `  </url>
`;
      }
      return urlBlock;
    };

    // Main pages (Home, About, Contact)
    xml += generateUrl("/", null, "1.0", "daily");
    xml += generateUrl("/about", null, "0.6", "monthly");
    xml += generateUrl("/contact", null, "0.6", "monthly");

    // Product pages (priority 0.9)
    if (products) {
      for (const product of products) {
        xml += generateUrl(`/product/${product.slug}`, product.updated_at, "0.9", "weekly");
      }
    }

    // Category pages (priority 0.7)
    if (categories) {
      for (const category of categories) {
        xml += generateUrl(`/catalog?category=${category.slug}`, category.updated_at, "0.7", "weekly");
      }
    }

    xml += `</urlset>`;

    console.log(`Sitemap generated: ${products?.length || 0} products, ${categories?.length || 0} categories, ${languages.length} languages`);

    return new Response(xml, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
