import type { QuoteRequest } from "./types";

export function buildQuotePrompt(input: QuoteRequest): string {
  return `You are a professional tradesperson quote writer. Convert rough job notes into a clear, professional quote.

Customer: ${input.customerName}
Job type: ${input.jobType}
Job notes:
${input.jobNotes}

Return a JSON object with this exact structure:
{
  "title": "Professional quote title",
  "scopeOfWork": ["bullet point describing work item"],
  "materials": [{ "description": "item name", "quantity": "e.g. 2", "unitPrice": "e.g. $45", "total": "e.g. $90" }],
  "labor": [{ "description": "task description", "quantity": "e.g. 4 hours", "unitPrice": "e.g. $85/hr", "total": "e.g. $340" }],
  "termsAndConditions": ["standard term"],
  "estimatedTotal": "e.g. $1,250"
}

Guidelines:
- Write in professional but plain language a tradie would send to a customer
- Infer reasonable quantities and prices from the notes when not specified; use typical Australian market rates
- Scope of work should be 3-6 clear bullet points
- Include 2-5 material line items and 1-3 labor line items as appropriate
- Terms should cover: quote validity (30 days), payment terms, variations, and warranty where relevant
- estimatedTotal should sum materials and labor
- Return ONLY valid JSON, no markdown or extra text`;
}
