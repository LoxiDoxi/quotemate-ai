import { supabase } from "./supabase";

export type SavedQuote = {
  id: string;
  customerName: string;
  jobType: string;
  jobNotes: string;
  createdAt: string;
  quote: any;
};

export async function getQuotes() {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) throw error;

  return data as SavedQuote[];
}

export async function saveQuote(savedQuote: SavedQuote) {
  const { error } = await supabase
    .from("quotes")
    .insert(savedQuote);

  if (error) throw error;
}

export async function deleteQuote(id: string) {
  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}