import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebEntity {
  entityId?: string;
  score?: number;
  description?: string;
}

interface WebPage {
  url: string;
  score: number;
  pageTitle?: string;
}

interface ReverseSearchResult {
  webEntities: Array<{
    description: string;
    score: number;
  }>;
  fullMatchingImages: WebPage[];
  partialMatchingImages: WebPage[];
  pagesWithMatchingImages: WebPage[];
  oldestUrl: string | null;
  oldestDate: string | null;
  knownWebsites: string[];
  bestGuessLabel: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY');
    
    if (!GOOGLE_VISION_API_KEY) {
      console.error('GOOGLE_VISION_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Google Vision API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling Google Vision API for web detection...');

    // Call Google Vision API - Web Detection
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64,
              },
              features: [
                {
                  type: 'WEB_DETECTION',
                  maxResults: 20,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Google Vision API error:', visionResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Google Vision API request failed',
          details: errorText 
        }),
        { status: visionResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const visionData = await visionResponse.json();
    console.log('Google Vision API response received');

    const webDetection = visionData.responses?.[0]?.webDetection;

    if (!webDetection) {
      return new Response(
        JSON.stringify({
          webEntities: [],
          fullMatchingImages: [],
          partialMatchingImages: [],
          pagesWithMatchingImages: [],
          oldestUrl: null,
          oldestDate: null,
          knownWebsites: [],
          bestGuessLabel: null,
        } as ReverseSearchResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract web entities (what the image contains)
    const webEntities = (webDetection.webEntities || [])
      .filter((entity: WebEntity) => entity.description)
      .map((entity: WebEntity) => ({
        description: entity.description || '',
        score: entity.score || 0,
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);

    // Extract full matching images
    const fullMatchingImages = (webDetection.fullMatchingImages || [])
      .map((img: any) => ({
        url: img.url,
        score: img.score || 1.0,
      }))
      .slice(0, 10);

    // Extract partial matching images
    const partialMatchingImages = (webDetection.partialMatchingImages || [])
      .map((img: any) => ({
        url: img.url,
        score: img.score || 0.5,
      }))
      .slice(0, 10);

    // Extract pages with matching images
    const pagesWithMatchingImages = (webDetection.pagesWithMatchingImages || [])
      .map((page: any) => ({
        url: page.url,
        score: page.score || 0.8,
        pageTitle: page.pageTitle,
      }))
      .slice(0, 15);

    // Find oldest URL (heuristic: look for oldest-looking domain or archive.org)
    let oldestUrl: string | null = null;
    let oldestDate: string | null = null;

    for (const page of pagesWithMatchingImages) {
      if (page.url.includes('archive.org')) {
        oldestUrl = page.url;
        // Try to extract date from archive.org URL
        const dateMatch = page.url.match(/\/(\d{8})\//);
        if (dateMatch) {
          const dateStr = dateMatch[1];
          oldestDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        }
        break;
      }
    }

    // If no archive.org, use the first full match or page with matching image
    if (!oldestUrl && pagesWithMatchingImages.length > 0) {
      oldestUrl = pagesWithMatchingImages[0].url;
    }

    // Extract known websites (domains)
    const knownWebsites = Array.from(
      new Set(
        pagesWithMatchingImages
          .map((page: WebPage) => {
            try {
              return new URL(page.url).hostname;
            } catch {
              return null;
            }
          })
          .filter(Boolean) as string[]
      )
    ).slice(0, 10);

    // Best guess labels
    const bestGuessLabel = webDetection.bestGuessLabels?.[0]?.label || null;

    const result: ReverseSearchResult = {
      webEntities,
      fullMatchingImages,
      partialMatchingImages,
      pagesWithMatchingImages,
      oldestUrl,
      oldestDate,
      knownWebsites,
      bestGuessLabel,
    };

    console.log('Reverse search completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reverse-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
