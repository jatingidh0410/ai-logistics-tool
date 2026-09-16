import { Request, Response } from 'express';
import { AIService } from '../services/aiService.js';
import { getShipmentsWithFiltersFromDb } from '../db/index.js';

export class AIController {
  public static async parseQuery(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string' || query.trim() === '') {
        res.status(400).json({ error: 'Query string is required.' });
        return;
      }

      const parsedResult = await AIService.parseNLQuery(query);
      const shipments = await getShipmentsWithFiltersFromDb(parsedResult.extractedFilters);

      res.status(200).json({
        explanation: parsedResult.explanation,
        extractedFilters: parsedResult.extractedFilters,
        count: shipments.length,
        shipments,
      });
    } catch (error) {
      console.error('Error handling AI query:', error);
      res.status(500).json({ error: 'Failed to process natural language query.' });
    }
  }

  public static async parseDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentText } = req.body;
      if (!documentText || typeof documentText !== 'string' || documentText.trim() === '') {
        res.status(400).json({ error: 'documentText is required.' });
        return;
      }

      const parsedData = await AIService.parseDocument(documentText);

      res.status(200).json({
        success: true,
        data: parsedData,
      });
    } catch (error) {
      console.error('Error parsing document:', error);
      res.status(500).json({ error: 'Failed to parse document text.' });
    }
  }
}
