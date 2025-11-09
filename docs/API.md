# API Documentation

Complete API reference for RealityRadar edge functions and external integrations.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Edge Functions](#edge-functions)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Examples](#examples)

---

## 🌐 Overview

RealityRadar provides serverless API endpoints via Lovable Cloud (Supabase Edge Functions). All endpoints are RESTful and return JSON responses.

**Base URL**: `https://ixsvjmofdzohiltskejt.supabase.co/functions/v1`

**Content-Type**: `application/json`

**CORS**: Enabled for all origins

---

## 🔐 Authentication

### Public Endpoints

Currently, all analysis endpoints are **public** and do not require authentication.

### Future: Authenticated Endpoints

When authentication is enabled:

```typescript
// Include Supabase auth token in headers
const response = await fetch(`${baseUrl}/analyze-content`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseToken}`,
  },
  body: JSON.stringify({...}),
});
```

---

## 📡 Edge Functions

### 1. Analyze Content

Performs comprehensive deepfake analysis on images, videos, or text.

#### Endpoint

```
POST /functions/v1/analyze-content
```

#### Request Body

```typescript
interface AnalyzeContentRequest {
  type: 'image' | 'video' | 'text';
  content?: string;  // Base64-encoded content OR raw text
  url?: string;      // Alternative to content: URL to analyze
  options?: {
    includeExif?: boolean;      // Default: true
    includeELA?: boolean;       // Default: true
    includeFFT?: boolean;       // Default: true
    includeReverseSearch?: boolean;  // Default: true
  };
}
```

**Example: Image Analysis**

```json
{
  "type": "image",
  "content": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "options": {
    "includeExif": true,
    "includeELA": true,
    "includeFFT": true,
    "includeReverseSearch": true
  }
}
```

**Example: URL Analysis**

```json
{
  "type": "image",
  "url": "https://example.com/image.jpg"
}
```

**Example: Text Analysis**

```json
{
  "type": "text",
  "content": "This is the text content to analyze for AI generation patterns..."
}
```

#### Response

```typescript
interface AnalyzeContentResponse {
  success: boolean;
  data?: {
    score: number;              // 0-100, higher = more authentic
    verdict: 'Authentic' | 'Suspicious' | 'Likely Fake';
    confidence: number;         // 0-1, confidence in verdict
    reasoning: string[];        // Human-readable explanations
    breakdown: {
      exif?: ExifAnalysis;
      ela?: ELAAnalysis;
      fft?: FFTAnalysis;
      reverseSearch?: ReverseSearchAnalysis;
    };
    timestamp: string;          // ISO 8601
  };
  error?: string;
}
```

**Success Response (200)**

```json
{
  "success": true,
  "data": {
    "score": 75,
    "verdict": "Likely Authentic",
    "confidence": 0.85,
    "reasoning": [
      "EXIF metadata indicates original camera capture",
      "Compression patterns consistent with single save",
      "Image found on reputable news sources from 2023",
      "Natural frequency distribution detected"
    ],
    "breakdown": {
      "exif": {
        "score": 80,
        "camera": "Canon EOS 5D Mark IV",
        "software": null,
        "dateTime": "2023-06-15T10:30:00Z",
        "hasBeenModified": false,
        "suspiciousEdits": []
      },
      "ela": {
        "score": 70,
        "heatmapUrl": "data:image/png;base64,...",
        "suspiciousZones": [
          { "x": 100, "y": 200, "width": 50, "height": 50, "intensity": 25 }
        ],
        "overallScore": 70,
        "details": "Minor compression artifacts detected in background"
      },
      "fft": {
        "score": 75,
        "highFrequencyRatio": 0.42,
        "spectralAnomaly": 0.18,
        "isAiGenerated": false,
        "confidence": 0.82,
        "details": "Frequency distribution consistent with natural photography"
      },
      "reverseSearch": {
        "score": 80,
        "webEntities": [
          { "entityId": "...", "description": "Sunset", "score": 0.95 }
        ],
        "fullMatchingImages": [
          "https://news.example.com/article/sunset-2023.jpg"
        ],
        "pagesWithMatchingImages": [
          {
            "url": "https://news.example.com/article/sunset",
            "pageTitle": "Beautiful Sunset Captured in...",
            "fullMatchingImages": ["https://..."]
          }
        ],
        "oldestUrl": "https://news.example.com/article/sunset",
        "oldestDate": "2023-06-15",
        "knownWebsites": ["news.example.com"]
      }
    },
    "timestamp": "2025-01-09T15:30:00Z"
  }
}
```

**Error Response (400)**

```json
{
  "success": false,
  "error": "Missing required field: type"
}
```

**Error Response (500)**

```json
{
  "success": false,
  "error": "Analysis failed: Unable to process image"
}
```

#### Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Analysis completed successfully |
| 400 | Bad Request | Invalid request parameters |
| 413 | Payload Too Large | File size exceeds limit (10MB) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error during analysis |
| 503 | Service Unavailable | External API (Google Vision) unavailable |

---

### 2. Reverse Image Search

Performs reverse image search using Google Vision API.

#### Endpoint

```
POST /functions/v1/reverse-search
```

#### Request Body

```typescript
interface ReverseSearchRequest {
  image: string;  // Base64-encoded image
}
```

**Example**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

#### Response

```typescript
interface ReverseSearchResponse {
  success: boolean;
  data?: {
    webEntities: Array<{
      entityId: string;
      description: string;
      score: number;  // 0-1
    }>;
    fullMatchingImages: string[];  // URLs
    partialMatchingImages: string[];  // URLs
    pagesWithMatchingImages: Array<{
      url: string;
      pageTitle?: string;
      fullMatchingImages: string[];
      partialMatchingImages: string[];
    }>;
    visuallySimilarImages: string[];  // URLs
    bestGuessLabels: Array<{
      label: string;
      languageCode: string;
    }>;
    oldestUrl?: string;
    oldestDate?: string;  // YYYY-MM-DD
    knownWebsites: string[];  // Domain names
  };
  error?: string;
}
```

**Success Response (200)**

```json
{
  "success": true,
  "data": {
    "webEntities": [
      {
        "entityId": "/m/0dl567",
        "description": "Sunset",
        "score": 0.95
      },
      {
        "entityId": "/m/01bqvp",
        "description": "Sky",
        "score": 0.88
      }
    ],
    "fullMatchingImages": [
      "https://news.example.com/images/sunset-2023.jpg",
      "https://photos.example.com/gallery/sunset.jpg"
    ],
    "partialMatchingImages": [
      "https://example.com/similar-sunset.jpg"
    ],
    "pagesWithMatchingImages": [
      {
        "url": "https://news.example.com/article/beautiful-sunset",
        "pageTitle": "Beautiful Sunset Captured in California",
        "fullMatchingImages": [
          "https://news.example.com/images/sunset-2023.jpg"
        ],
        "partialMatchingImages": []
      }
    ],
    "visuallySimilarImages": [
      "https://example.com/sunset1.jpg",
      "https://example.com/sunset2.jpg"
    ],
    "bestGuessLabels": [
      { "label": "Sunset Beach California", "languageCode": "en" }
    ],
    "oldestUrl": "https://news.example.com/article/beautiful-sunset",
    "oldestDate": "2023-06-15",
    "knownWebsites": [
      "news.example.com",
      "photos.example.com"
    ]
  }
}
```

**Error Response (400)**

```json
{
  "success": false,
  "error": "Missing required field: image"
}
```

**Error Response (503)**

```json
{
  "success": false,
  "error": "Google Vision API unavailable"
}
```

#### Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Search completed successfully |
| 400 | Bad Request | Invalid request (missing image) |
| 401 | Unauthorized | Google Vision API key invalid |
| 429 | Too Many Requests | Rate limit exceeded |
| 503 | Service Unavailable | Google Vision API unavailable |

---

## 📊 Response Formats

### Standard Success Response

All successful API calls return:

```typescript
{
  success: true,
  data: {
    // Response-specific data
  }
}
```

### Standard Error Response

All errors return:

```typescript
{
  success: false,
  error: "Human-readable error message"
}
```

### Nested Analysis Objects

#### ExifAnalysis

```typescript
interface ExifAnalysis {
  score: number;          // 0-100
  camera?: string;        // e.g., "Canon EOS 5D Mark IV"
  software?: string;      // e.g., "Adobe Photoshop CC"
  dateTime?: string;      // ISO 8601
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  hasBeenModified: boolean;
  suspiciousEdits: string[];
  details?: string;
}
```

#### ELAAnalysis

```typescript
interface ELAAnalysis {
  score: number;          // 0-100
  heatmapUrl: string;     // Data URI or URL to heatmap image
  suspiciousZones: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    intensity: number;    // 0-255
  }>;
  overallScore: number;   // Duplicate of score for consistency
  details: string;
}
```

#### FFTAnalysis

```typescript
interface FFTAnalysis {
  score: number;              // 0-100
  highFrequencyRatio: number; // 0-1
  spectralAnomaly: number;    // 0-1+
  isAiGenerated: boolean;
  confidence: number;         // 0-1
  details: string;
}
```

#### ReverseSearchAnalysis

See [Reverse Image Search Response](#response-1) above.

---

## ⚠️ Error Handling

### Client-Side Error Handling

```typescript
async function analyzeImage(file: File) {
  try {
    const base64 = await fileToBase64(file);
    
    const response = await fetch(
      'https://ixsvjmofdzohiltskejt.supabase.co/functions/v1/analyze-content',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'image',
          content: base64,
        }),
      }
    );
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Analysis failed');
    }
    
    return result.data;
    
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      console.error('Network error:', error);
      throw new Error('Unable to connect to analysis service');
    } else {
      // API error
      console.error('API error:', error);
      throw error;
    }
  }
}
```

### Error Types

| Error Type | Cause | Solution |
|------------|-------|----------|
| Network Error | No internet, server down | Retry with exponential backoff |
| 400 Bad Request | Invalid parameters | Validate input before sending |
| 413 Payload Too Large | File > 10MB | Resize or compress image |
| 429 Rate Limit | Too many requests | Implement rate limiting, retry after delay |
| 500 Server Error | Backend issue | Retry, report if persists |
| 503 Service Unavailable | External API down | Retry, gracefully degrade (skip that analysis) |

---

## 🚦 Rate Limits

### Current Limits

- **Analyze Content**: 10 requests/minute per IP
- **Reverse Search**: 5 requests/minute per IP

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1641234567
```

### Handling Rate Limits

```typescript
async function analyzeWithRetry(file: File, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await analyzeImage(file);
    } catch (error) {
      if (error.status === 429) {
        const resetTime = error.headers['X-RateLimit-Reset'];
        const delay = Math.max(0, resetTime * 1000 - Date.now());
        
        console.log(`Rate limited. Waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        continue;  // Retry
      }
      
      throw error;  // Other errors: don't retry
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

---

## 💡 Examples

### Example 1: Analyze Uploaded Image

```typescript
// React component
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function ImageAnalyzer() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const analyzeImage = async (file: File) => {
    setLoading(true);
    
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      // Call edge function
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: {
          type: 'image',
          content: base64,
        },
      });
      
      if (error) throw error;
      
      setResult(data.data);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) analyzeImage(file);
        }}
      />
      
      {loading && <p>Analyzing...</p>}
      
      {result && (
        <div>
          <h2>Score: {result.score}</h2>
          <p>Verdict: {result.verdict}</p>
          <ul>
            {result.reasoning.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Analyze Image from URL

```typescript
async function analyzeImageFromURL(imageUrl: string) {
  const { data, error } = await supabase.functions.invoke('analyze-content', {
    body: {
      type: 'image',
      url: imageUrl,
    },
  });
  
  if (error) {
    console.error('Error:', error);
    return null;
  }
  
  return data.data;
}

// Usage
const result = await analyzeImageFromURL('https://example.com/photo.jpg');
console.log('Analysis result:', result);
```

### Example 3: Reverse Image Search Only

```typescript
async function searchImage(file: File) {
  // Convert to base64
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64Only = result.split(',')[1];
      resolve(base64Only);
    };
    reader.readAsDataURL(file);
  });
  
  // Call reverse search
  const { data, error } = await supabase.functions.invoke('reverse-search', {
    body: { image: base64 },
  });
  
  if (error) throw error;
  
  return data.data;
}

// Usage
const file = document.querySelector('input[type="file"]').files[0];
const searchResults = await searchImage(file);

console.log('Web entities:', searchResults.webEntities);
console.log('Matching images:', searchResults.fullMatchingImages);
```

### Example 4: Batch Analysis with Progress

```typescript
async function analyzeBatch(files: File[]) {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    console.log(`Analyzing ${i + 1}/${files.length}: ${file.name}`);
    
    try {
      const result = await analyzeImage(file);
      results.push({ file: file.name, result });
    } catch (error) {
      results.push({ file: file.name, error: error.message });
    }
    
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

// Usage
const files = Array.from(document.querySelector('input[type="file"]').files);
const batchResults = await analyzeBatch(files);

console.log('Batch analysis complete:', batchResults);
```

---

<div align="center">

**[Back to Main README](../README.md)** | **[Technical Docs](./TECHNICAL.md)** | **[Architecture](./ARCHITECTURE.md)**

</div>
