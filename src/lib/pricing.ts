import { createSupabaseServerClient } from "./supabase-server";

export async function getPricing(
  jobType: string,
  jobNotes: string
) {

  const supabase = await createSupabaseServerClient();


  const { data, error } = await supabase
    .from("trade_pricing")
    .select("*");


  console.log("ALL PRICING ROWS:", data);
  console.log("SUPABASE ERROR:", error);


  return data ?? [];

}