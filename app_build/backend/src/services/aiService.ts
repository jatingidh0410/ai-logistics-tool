import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedNLQuery, ParsedDocumentData, ShipmentStatus } from '../types/index.js';

export class AIService {
  private static getGeminiClient(): GoogleGenerativeAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      return new GoogleGenerativeAI(apiKey);
    }
    return null;
  }

  /**
   * Parses natural language query into database filters.
   * Example query: "Show me all delayed shipments heading to Pune"
   */
  public static async parseNLQuery(userQuery: string): Promise<ParsedNLQuery> {
    const gemini = this.getGeminiClient();

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an intelligent logistics AI assistant for Nagarkot Forwarders.
Translate the user's natural language search query into structured database filters for shipments.

Possible Shipment Statuses:
- "Booked"
- "In Transit"
- "Customs Hold"
- "Out for Delivery"
- "Delivered"
- "Cancelled"

Instructions:
1. Extract any status filter if implied (e.g., "delayed" maps to status "Customs Hold" or isDelayed: true).
2. Extract origin city/port if mentioned (e.g. "from Mumbai" -> origin: "Mumbai").
3. Extract destination city/port if mentioned (e.g. "to Pune" or "heading to Rotterdam" -> destination: "Pune" or "Rotterdam").
4. Extract carrier if mentioned (e.g. "Maersk", "MSC", "CMA CGM").
5. Return JSON ONLY matching this format:
{
  "status": string | null,
  "origin": string | null,
  "destination": string | null,
  "carrier": string | null,
  "isDelayed": boolean,
  "searchQuery": string | null,
  "explanation": "Short friendly summary of how query was understood"
}

User Query: "${userQuery}"
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            extractedFilters: {
              status: parsed.status || undefined,
              origin: parsed.origin || undefined,
              destination: parsed.destination || undefined,
              carrier: parsed.carrier || undefined,
              isDelayed: parsed.isDelayed || false,
              searchQuery: parsed.searchQuery || undefined,
            },
            explanation: parsed.explanation || `Filtered by ${userQuery}`,
          };
        }
      } catch (err) {
        console.warn('⚠️ Gemini API call failed or timed out. Falling back to local NLP parser:', (err as Error).message);
      }
    }

    // Local Fallback Rule-Based NLP Parser
    return this.fallbackNLParser(userQuery);
  }

  private static fallbackNLParser(userQuery: string): ParsedNLQuery {
    const q = userQuery.toLowerCase();

    let status: ShipmentStatus | 'Delayed' | undefined = undefined;
    let isDelayed = false;
    let origin: string | undefined = undefined;
    let destination: string | undefined = undefined;
    let carrier: string | undefined = undefined;
    const explanations: string[] = [];

    // Detect Status
    if (q.includes('delayed') || q.includes('delay') || q.includes('stuck') || q.includes('late')) {
      isDelayed = true;
      explanations.push('Filtering for delayed / customs hold shipments');
    } else if (q.includes('customs') || q.includes('hold') || q.includes('customs hold')) {
      status = 'Customs Hold';
      explanations.push('Status: Customs Hold');
    } else if (q.includes('transit') || q.includes('moving') || q.includes('shipped')) {
      status = 'In Transit';
      explanations.push('Status: In Transit');
    } else if (q.includes('delivered') || q.includes('completed') || q.includes('arrived')) {
      status = 'Delivered';
      explanations.push('Status: Delivered');
    } else if (q.includes('booked') || q.includes('new') || q.includes('pending')) {
      status = 'Booked';
      explanations.push('Status: Booked');
    } else if (q.includes('out for delivery') || q.includes('dispatched')) {
      status = 'Out for Delivery';
      explanations.push('Status: Out for Delivery');
    }

    // Detect Origin (e.g. "from Mumbai", "origin Shanghai", "departing Singapore")
    const originMatch = q.match(/(?:from|origin|departing|ex)\s+([a-z0-9\s]+?)(?=\s+(?:to|heading|carrier|status|with|delayed|in|is|\.|$))/i);
    if (originMatch && originMatch[1]) {
      origin = originMatch[1].trim();
      explanations.push(`Origin matching "${origin}"`);
    }

    // Detect Destination (e.g. "to Pune", "heading to Rotterdam", "bound for Hamburg")
    const destMatch = q.match(/(?:to|heading to|bound for|destination|for)\s+([a-z0-9\s]+?)(?=\s+(?:from|carrier|status|with|delayed|via|\.|$))/i);
    if (destMatch && destMatch[1]) {
      destination = destMatch[1].trim();
      explanations.push(`Destination matching "${destination}"`);
    }

    // Detect Carrier
    const knownCarriers = ['maersk', 'msc', 'cma cgm', 'hapag-lloyd', 'evergreen', 'one', 'cosco'];
    for (const c of knownCarriers) {
      if (q.includes(c)) {
        carrier = c.toUpperCase();
        explanations.push(`Carrier matching "${carrier}"`);
        break;
      }
    }

    const explanationStr = explanations.length > 0
      ? `Parsed query: ${explanations.join(', ')}`
      : `Searching keywords in shipment records for "${userQuery}"`;

    return {
      extractedFilters: {
        status,
        origin,
        destination,
        carrier,
        isDelayed,
        searchQuery: explanations.length === 0 ? userQuery : undefined,
      },
      explanation: explanationStr,
    };
  }

  /**
   * Parses unstructured document text (Invoice, Bill of Lading, Freight Notice) into structured fields.
   */
  public static async parseDocument(documentText: string): Promise<ParsedDocumentData> {
    const gemini = this.getGeminiClient();

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are an expert OCR & Document Parser for international freight invoices and bills of lading.
Extract structured shipment data from the unstructured text provided below.

Fields to extract:
- reference_number: Tracking ID / Ref # (e.g., NKT-2026-9820, BL-99824)
- origin: Origin city/port (e.g., Mumbai, Shanghai, Dubai)
- destination: Destination city/port (e.g., Pune, Rotterdam, Hamburg)
- expected_delivery_date: Estimated delivery date (ISO format YYYY-MM-DD)
- carrier: Ocean or Air carrier company (e.g., Maersk, MSC, Hapag-Lloyd)
- notes: Short description of goods or special instructions
- confidenceScore: Number from 0.0 to 1.0 indicating extraction quality

Return JSON ONLY:
{
  "reference_number": string,
  "origin": string,
  "destination": string,
  "expected_delivery_date": string,
  "carrier": string,
  "notes": string,
  "confidenceScore": number
}

Document Content:
"""
${documentText}
"""
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            reference_number: parsed.reference_number || `NKT-${Math.floor(100000 + Math.random() * 900000)}`,
            origin: parsed.origin || 'Unknown Origin',
            destination: parsed.destination || 'Unknown Destination',
            expected_delivery_date: parsed.expected_delivery_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            carrier: parsed.carrier || 'Standard Freight',
            notes: parsed.notes || 'Extracted automatically from document.',
            confidenceScore: parsed.confidenceScore || 0.92,
          };
        }
      } catch (err) {
        console.warn('⚠️ Gemini document parser failed or offline. Using local regex document parser:', (err as Error).message);
      }
    }

    return this.fallbackDocParser(documentText);
  }

  private static fallbackDocParser(documentText: string): ParsedDocumentData {
    // Regex heuristics for reference numbers (e.g., NKT-2026-104, BL-98124, REF# 8812)
    const refMatch = documentText.match(/(?:tracking|ref|reference|bl|invoice|b\/l)\s*#?:?\s*([A-Z0-9-]{5,20})/i)
      || documentText.match(/([A-Z]{3,4}-\d{4}-\d{4})/i);
    const refNum = refMatch ? refMatch[1] : `NKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Regex for origin
    const originMatch = documentText.match(/(?:origin|from|port of loading|pol):?\s*([A-Za-z0-9\s,()]+?)(?=\n|\r|destination|to|pod|$)/i);
    const origin = originMatch ? originMatch[1].trim() : 'Mumbai Port (INBOM)';

    // Regex for destination
    const destMatch = documentText.match(/(?:destination|to|port of discharge|pod):?\s*([A-Za-z0-9\s,()]+?)(?=\n|\r|carrier|date|eta|$)/i);
    const destination = destMatch ? destMatch[1].trim() : 'Pune Inland Depot (INPNE)';

    // Date regex (e.g., 2026-09-25, 25/09/2026, Sept 25, 2026)
    const dateMatch = documentText.match(/(?:eta|delivery date|date|expected):?\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|[A-Za-z]{3}\s+\d{1,2},?\s+\d{4})/i);
    let deliveryDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    if (dateMatch && dateMatch[1]) {
      const parsedDate = new Date(dateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        deliveryDate = parsedDate.toISOString().split('T')[0];
      }
    }

    // Carrier detection
    const carrierMatch = documentText.match(/(?:carrier|vessel|line|shipping co):?\s*([A-Za-z0-9\s-]+?)(?=\n|\r|notes|goods|$)/i);
    let carrier = carrierMatch ? carrierMatch[1].trim() : 'Maersk Line';
    if (!carrierMatch) {
      if (/msc/i.test(documentText)) carrier = 'MSC Mediterranean Shipping';
      else if (/cma/i.test(documentText)) carrier = 'CMA CGM Group';
      else if (/hapag/i.test(documentText)) carrier = 'Hapag-Lloyd';
    }

    // Notes detection
    const notesMatch = documentText.match(/(?:cargo|description|goods|notes):?\s*([^\n\r]+)/i);
    const notes = notesMatch ? notesMatch[1].trim() : 'Extracted from document: Standard container cargo.';

    return {
      reference_number: refNum.toUpperCase(),
      origin,
      destination,
      expected_delivery_date: deliveryDate,
      carrier,
      notes,
      confidenceScore: 0.88,
    };
  }
}
