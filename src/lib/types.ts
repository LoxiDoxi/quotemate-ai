export const JOB_TYPES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Roofing",
  "Landscaping",
  "Tiling",
  "HVAC",
  "General Handyman",
  "Other",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export interface QuoteRequest {
  customerName: string;
  jobType: JobType;
  jobNotes: string;
}

export interface QuoteLineItem {
  description: string;
  quantity?: string;
  unitPrice?: string;
  total?: string;
}

export interface Quote {
  title: string;
  scopeOfWork: string[];
  materials: QuoteLineItem[];
  labor: QuoteLineItem[];
  termsAndConditions: string[];
  estimatedTotal?: string;
}

export interface GenerateQuoteResponse {
  quote: Quote;
}

export interface ApiError {
  error: string;
}
