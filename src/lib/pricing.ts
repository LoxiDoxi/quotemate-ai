import { createSupabaseServerClient } from "./supabase-server";

export async function getPricing(
  jobType: string,
  jobNotes: string
) {
  const supabase = await createSupabaseServerClient();

  const searchText = `${jobType} ${jobNotes}`;

  const { data, error } = await supabase
    .from("trade_pricing")
    .select("*")
    .or(
      `job_name.ilike.%${searchText}%,trade.ilike.%${jobType}%`
    )
    .limit(5);


  if (error) {
    console.error("Pricing lookup failed:", error);
    return [];
  }


  return data || [];
}