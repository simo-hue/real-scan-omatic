# Technical Documentation

Deep dive into RealityRadar's detection algorithms, analysis techniques, and technical implementation.

---

## 📋 Table of Contents

- [Detection Algorithms](#detection-algorithms)
- [Image Analysis](#image-analysis)
- [Video Analysis](#video-analysis)
- [Text Analysis](#text-analysis)
- [Reverse Image Search](#reverse-image-search)
- [Performance Optimization](#performance-optimization)
- [API Specifications](#api-specifications)

---

## 🔬 Detection Algorithms

RealityRadar employs a multi-layered approach to deepfake detection, combining traditional forensics with modern AI techniques.

### Detection Pipeline

```
Input Media
    ↓
Preprocessing
    ↓
┌─────────────────────────────────┐
│   Parallel Analysis Streams     │
├─────────────────────────────────┤
│ • EXIF Metadata                 │
│ • Error Level Analysis (ELA)    │
│ • Fast Fourier Transform (FFT)  │
│ • Reverse Image Search          │
│ • AI Pattern Detection          │
└─────────────────────────────────┘
    ↓
Score Aggregation
    ↓
Confidence Calculation
    ↓
Result + Explanation
```

### Scoring System

Each analysis method contributes to the final authenticity score:

```typescript
finalScore = (
  exifScore * 0.25 +      // 25% weight
  elaScore * 0.30 +       // 30% weight
  fftScore * 0.25 +       // 25% weight
  reverseSearchScore * 0.20  // 20% weight
)

confidence = calculateConfidence([
  exifConfidence,
  elaConfidence,
  fftConfidence,
  reverseSearchConfidence
])
```

**Verdict Thresholds**:
- `score >= 70`: Authentic (Green)
- `40 < score < 70`: Suspicious (Yellow)
- `score <= 40`: Likely Fake (Red)

---

## 🖼️ Image Analysis

### 1. EXIF Metadata Extraction

**Purpose**: Detect software manipulation signatures and inconsistencies in image metadata.

**Implementation**: `src/utils/exifExtractor.ts`

#### Technical Details

```typescript
import * as exifr from 'exifr';

interface ExifData {
  camera?: string;
  software?: string;
  dateTime?: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
  hasBeenModified: boolean;
  suspiciousEdits: string[];
}

async function extractExifData(file: File): Promise<ExifData | undefined> {
  const exif = await exifr.parse(file, {
    tiff: true,
    xmp: true,
    icc: true,
    iptc: true,
    jfif: true,
  });
  
  // Analyze metadata for suspicious patterns
  const suspiciousEdits = detectSuspiciousEdits(exif);
  
  return {
    camera: exif?.Make ? `${exif.Make} ${exif.Model}` : undefined,
    software: exif?.Software,
    dateTime: exif?.DateTime,
    gps: extractGPS(exif),
    hasBeenModified: suspiciousEdits.length > 0,
    suspiciousEdits,
  };
}
```

#### Suspicious Edit Detection

**Red Flags Detected**:

1. **Editing Software Signatures**:
   ```typescript
   const EDITING_SOFTWARE = [
     'Adobe Photoshop',
     'GIMP',
     'Paint.NET',
     'Affinity Photo',
     'PhotoDirector',
   ];
   ```

2. **Timestamp Discrepancies**:
   - `DateTimeOriginal` ≠ `DateTime`
   - Future dates
   - Dates before digital photography era (<1990)

3. **Missing Critical Metadata**:
   - No camera make/model on claimed "camera" photo
   - Missing GPS data on geotagged photos
   - No lens information on DSLR photos

4. **AI Generation Indicators**:
   - Software: "Midjourney", "DALL-E", "Stable Diffusion"
   - XMP tags: "AIGenerated", "SyntheticMedia"

5. **XMP History Analysis**:
   ```typescript
   if (exif.xmp?.History) {
     // Count number of edit operations
     const editCount = exif.xmp.History.length;
     if (editCount > 5) {
       suspiciousEdits.push(`Heavy editing detected (${editCount} operations)`);
     }
   }
   ```

#### Scoring Algorithm

```typescript
function calculateExifScore(exifData: ExifData): number {
  let score = 100;
  
  // Deduct points for suspicious indicators
  score -= exifData.suspiciousEdits.length * 15;
  
  // Missing metadata penalty
  if (!exifData.camera) score -= 10;
  if (!exifData.dateTime) score -= 10;
  
  // Bonus for authentic indicators
  if (exifData.camera && !exifData.hasBeenModified) score += 10;
  if (exifData.gps) score += 5;
  
  return Math.max(0, Math.min(100, score));
}
```

---

### 2. Error Level Analysis (ELA)

**Purpose**: Identify areas of an image that have been resaved at different compression levels, indicating potential manipulation.

**Implementation**: `src/utils/elaAnalyzer.ts`

#### Algorithm Overview

ELA works by:
1. Recompressing the image at a known quality level
2. Computing the difference between original and recompressed
3. Amplifying differences to create a heatmap
4. Identifying suspicious zones

#### Step-by-Step Process

**Step 1: Image Recompression**

```typescript
async function recompressImage(
  imageData: ImageData, 
  quality: number = 90
): Promise<ImageData> {
  // Create canvas with image
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  
  // Recompress to JPEG at specified quality
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality / 100);
  });
  
  // Load recompressed image back
  return await loadImageData(blob);
}
```

**Step 2: Pixel Difference Calculation**

```typescript
function calculatePixelDifferences(
  original: ImageData,
  recompressed: ImageData
): number[] {
  const differences: number[] = [];
  
  for (let i = 0; i < original.data.length; i += 4) {
    // Calculate per-channel differences
    const rDiff = Math.abs(original.data[i] - recompressed.data[i]);
    const gDiff = Math.abs(original.data[i + 1] - recompressed.data[i + 1]);
    const bDiff = Math.abs(original.data[i + 2] - recompressed.data[i + 2]);
    
    // Average difference for this pixel
    const avgDiff = (rDiff + gDiff + bDiff) / 3;
    differences.push(avgDiff);
  }
  
  return differences;
}
```

**Step 3: Heatmap Generation**

```typescript
function generateHeatmap(
  differences: number[],
  width: number,
  height: number,
  amplification: number = 10
): ImageData {
  const heatmap = new ImageData(width, height);
  
  for (let i = 0; i < differences.length; i++) {
    const diff = differences[i];
    const amplified = Math.min(255, diff * amplification);
    
    // Color mapping: Blue (low) → Green → Yellow → Red (high)
    const idx = i * 4;
    if (amplified < 64) {
      // Blue to Cyan
      heatmap.data[idx] = 0;
      heatmap.data[idx + 1] = amplified * 2;
      heatmap.data[idx + 2] = 255;
    } else if (amplified < 128) {
      // Cyan to Green
      heatmap.data[idx] = 0;
      heatmap.data[idx + 1] = 255;
      heatmap.data[idx + 2] = 255 - ((amplified - 64) * 4);
    } else if (amplified < 192) {
      // Green to Yellow
      heatmap.data[idx] = (amplified - 128) * 4;
      heatmap.data[idx + 1] = 255;
      heatmap.data[idx + 2] = 0;
    } else {
      // Yellow to Red
      heatmap.data[idx] = 255;
      heatmap.data[idx + 1] = 255 - ((amplified - 192) * 4);
      heatmap.data[idx + 2] = 0;
    }
    heatmap.data[idx + 3] = 255; // Alpha
  }
  
  return heatmap;
}
```

**Step 4: Suspicious Zone Detection**

```typescript
interface SuspiciousZone {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
}

function detectSuspiciousZones(
  differences: number[],
  width: number,
  height: number,
  gridSize: number = 32
): SuspiciousZone[] {
  const zones: SuspiciousZone[] = [];
  
  // Divide image into grid
  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      let totalDiff = 0;
      let pixelCount = 0;
      
      // Calculate average difference in this grid cell
      for (let dy = 0; dy < gridSize && y + dy < height; dy++) {
        for (let dx = 0; dx < gridSize && x + dx < width; dx++) {
          const idx = (y + dy) * width + (x + dx);
          totalDiff += differences[idx];
          pixelCount++;
        }
      }
      
      const avgDiff = totalDiff / pixelCount;
      
      // If average difference is high, mark as suspicious
      if (avgDiff > 20) {
        zones.push({
          x,
          y,
          width: Math.min(gridSize, width - x),
          height: Math.min(gridSize, height - y),
          intensity: avgDiff,
        });
      }
    }
  }
  
  // Sort by intensity and return top 10
  return zones
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 10);
}
```

#### Scoring Algorithm

```typescript
function calculateELAScore(
  suspiciousZones: SuspiciousZone[],
  imageArea: number
): number {
  // Calculate total suspicious area
  const suspiciousArea = suspiciousZones.reduce(
    (sum, zone) => sum + (zone.width * zone.height),
    0
  );
  
  // Calculate percentage of image that's suspicious
  const suspiciousPercentage = (suspiciousArea / imageArea) * 100;
  
  // Calculate average intensity
  const avgIntensity = suspiciousZones.reduce(
    (sum, zone) => sum + zone.intensity,
    0
  ) / suspiciousZones.length;
  
  // Score calculation
  let score = 100;
  score -= suspiciousPercentage * 2;  // Deduct based on area
  score -= (avgIntensity / 255) * 30; // Deduct based on intensity
  
  return Math.max(0, Math.min(100, score));
}
```

#### Interpretation Guide

**Heatmap Colors**:
- 🔵 **Blue/Dark**: Low error level (consistent compression)
- 🟢 **Green**: Moderate error level
- 🟡 **Yellow**: High error level (potential editing)
- 🔴 **Red**: Very high error level (likely manipulated)

**What to look for**:
- **Uniform heatmap**: Likely authentic
- **Localized bright spots**: Possible copy-paste or local edits
- **Object outlines in red**: Strong indicator of manipulation
- **Entire image bright**: May be heavily compressed (inconclusive)

---

### 3. Fast Fourier Transform (FFT) Analysis

**Purpose**: Detect AI-generated images by analyzing frequency patterns that differ from natural photographs.

**Implementation**: `src/utils/fftAnalyzer.ts`

#### Theoretical Background

Natural photographs contain:
- **High-frequency components**: Details, edges, textures
- **Low-frequency components**: Smooth gradients, backgrounds
- **Noise**: Random sensor noise, grain

AI-generated images often exhibit:
- **Unnatural frequency distribution**: Too smooth or too noisy
- **Missing noise patterns**: No sensor-specific noise
- **Spectral anomalies**: Unusual peaks in frequency domain
- **High-frequency suppression**: Overly smooth transitions

#### Algorithm Implementation

**Step 1: Image Preprocessing**

```typescript
async function preprocessImage(file: File): Promise<number[]> {
  // Load image
  const img = await loadImage(file);
  
  // Resize to manageable size (FFT is computationally expensive)
  const SIZE = 256;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
  
  // Convert to grayscale
  return convertToGrayscale(imageData);
}

function convertToGrayscale(imageData: ImageData): number[] {
  const grayscale: number[] = [];
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    
    // Luminosity method (weighted average)
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    grayscale.push(gray);
  }
  
  return grayscale;
}
```

**Step 2: 2D FFT Computation**

```typescript
function compute2DFFT(data: number[], size: number): number[][] {
  // Simplified implementation (production uses optimized FFT library)
  
  // Step 1: Apply FFT to each row
  const rowFFT: Complex[][] = [];
  for (let y = 0; y < size; y++) {
    const row = data.slice(y * size, (y + 1) * size);
    rowFFT.push(fft1D(row));
  }
  
  // Step 2: Apply FFT to each column
  const result: Complex[][] = [];
  for (let x = 0; x < size; x++) {
    const column = rowFFT.map(row => row[x]);
    const columnFFT = fft1D(column);
    
    for (let y = 0; y < size; y++) {
      if (!result[y]) result[y] = [];
      result[y][x] = columnFFT[y];
    }
  }
  
  // Convert complex numbers to magnitudes
  return result.map(row =>
    row.map(complex => Math.sqrt(complex.real ** 2 + complex.imag ** 2))
  );
}

function fft1D(input: number[]): Complex[] {
  // Cooley-Tukey FFT algorithm
  const N = input.length;
  
  if (N <= 1) {
    return [{ real: input[0] || 0, imag: 0 }];
  }
  
  // Divide
  const even = fft1D(input.filter((_, i) => i % 2 === 0));
  const odd = fft1D(input.filter((_, i) => i % 2 === 1));
  
  // Conquer
  const result: Complex[] = [];
  for (let k = 0; k < N / 2; k++) {
    const angle = -2 * Math.PI * k / N;
    const twiddle = {
      real: Math.cos(angle),
      imag: Math.sin(angle),
    };
    
    const oddPart = complexMultiply(twiddle, odd[k]);
    result[k] = complexAdd(even[k], oddPart);
    result[k + N / 2] = complexSubtract(even[k], oddPart);
  }
  
  return result;
}
```

**Step 3: Frequency Analysis**

```typescript
function calculateHighFrequencyRatio(
  fftData: number[][],
  size: number
): number {
  const center = size / 2;
  let lowFreqEnergy = 0;
  let highFreqEnergy = 0;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const magnitude = fftData[y][x];
      
      // Low frequency: center region (distance < size/4)
      // High frequency: outer region (distance >= size/4)
      if (distance < size / 4) {
        lowFreqEnergy += magnitude;
      } else {
        highFreqEnergy += magnitude;
      }
    }
  }
  
  // Ratio of high to low frequency energy
  return highFreqEnergy / (lowFreqEnergy + highFreqEnergy);
}
```

**Step 4: Spectral Anomaly Detection**

```typescript
function calculateSpectralAnomaly(
  fftData: number[][],
  size: number
): number {
  const center = size / 2;
  const radialProfile: number[] = [];
  const radialCounts: number[] = [];
  
  // Calculate radial average (average magnitude at each radius)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const radius = Math.floor(Math.sqrt(dx * dx + dy * dy));
      
      if (!radialProfile[radius]) {
        radialProfile[radius] = 0;
        radialCounts[radius] = 0;
      }
      
      radialProfile[radius] += fftData[y][x];
      radialCounts[radius]++;
    }
  }
  
  // Average
  for (let r = 0; r < radialProfile.length; r++) {
    if (radialCounts[r] > 0) {
      radialProfile[r] /= radialCounts[r];
    }
  }
  
  // Natural images follow a power law: magnitude ∝ 1/f
  // Calculate deviation from this expected pattern
  let anomalyScore = 0;
  for (let r = 1; r < radialProfile.length; r++) {
    const expected = radialProfile[1] / r; // Power law expectation
    const actual = radialProfile[r];
    const deviation = Math.abs(actual - expected) / expected;
    anomalyScore += deviation;
  }
  
  // Normalize
  return anomalyScore / radialProfile.length;
}
```

#### Scoring Algorithm

```typescript
function calculateFFTScore(
  highFreqRatio: number,
  spectralAnomaly: number
): number {
  let score = 100;
  
  // Natural photos: high-freq ratio around 0.3-0.5
  // AI-generated: often < 0.2 or > 0.6
  if (highFreqRatio < 0.2 || highFreqRatio > 0.6) {
    score -= 30;
  }
  
  // Spectral anomaly (deviation from power law)
  // Natural: < 0.3, AI: often > 0.5
  score -= spectralAnomaly * 50;
  
  return Math.max(0, Math.min(100, score));
}
```

#### Interpretation

**High-Frequency Ratio**:
- `< 0.2`: Overly smooth (AI-generated)
- `0.3 - 0.5`: Natural range
- `> 0.6`: Overly noisy (AI-generated or heavily compressed)

**Spectral Anomaly**:
- `< 0.3`: Follows natural distribution
- `0.3 - 0.5`: Suspicious
- `> 0.5`: Likely AI-generated

**Combined Verdict**:
```
if (highFreqRatio < 0.2 && spectralAnomaly > 0.5):
    "Strong AI generation indicators"
else if (highFreqRatio in [0.3, 0.5] && spectralAnomaly < 0.3):
    "Consistent with natural photography"
else:
    "Inconclusive - further analysis needed"
```

---

## 🔍 Reverse Image Search

**Purpose**: Verify image authenticity by finding similar images on the web and checking publication history.

**Implementation**: `supabase/functions/reverse-search/index.ts`

### Google Vision API Integration

```typescript
interface ReverseSearchResult {
  webEntities: WebEntity[];
  fullMatchingImages: string[];
  partialMatchingImages: string[];
  pagesWithMatchingImages: WebPage[];
  oldestUrl?: string;
  oldestDate?: string;
  knownWebsites: string[];
  bestGuessLabel?: string;
}

async function reverseImageSearch(
  imageBase64: string
): Promise<ReverseSearchResult> {
  const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: 'WEB_DETECTION', maxResults: 10 }],
        }],
      }),
    }
  );
  
  const data = await response.json();
  const webDetection = data.responses[0].webDetection;
  
  return processWebDetection(webDetection);
}
```

### Analysis Logic

```typescript
function analyzeReverseSearchResults(
  result: ReverseSearchResult
): {
  score: number;
  verdict: string;
  reasoning: string[];
} {
  let score = 50; // Start neutral
  const reasoning: string[] = [];
  
  // Has web entities (recognized objects/concepts)
  if (result.webEntities.length > 0) {
    score += 10;
    reasoning.push(`Image recognized: ${result.webEntities[0].description}`);
  }
  
  // Found exact matches online
  if (result.fullMatchingImages.length > 0) {
    score += 20;
    reasoning.push(`Found ${result.fullMatchingImages.length} exact matches online`);
  }
  
  // Found on reputable websites
  const reputableSources = result.knownWebsites.filter(url =>
    /\.(gov|edu|org|com\/(news|article))/.test(url)
  );
  if (reputableSources.length > 0) {
    score += 15;
    reasoning.push(`Found on reputable sources: ${reputableSources.length}`);
  }
  
  // Has publication history (old content)
  if (result.oldestDate) {
    const age = Date.now() - new Date(result.oldestDate).getTime();
    const ageInDays = age / (1000 * 60 * 60 * 24);
    
    if (ageInDays > 365) {
      score += 20;
      reasoning.push(`First published ${Math.floor(ageInDays / 365)} years ago`);
    } else if (ageInDays > 30) {
      score += 10;
      reasoning.push(`First published ${Math.floor(ageInDays)} days ago`);
    }
  }
  
  // No matches found (suspicious for claimed "real" photo)
  if (result.fullMatchingImages.length === 0 && 
      result.partialMatchingImages.length === 0) {
    score -= 10;
    reasoning.push('No similar images found online (unusual for authentic photos)');
  }
  
  // Verdict
  let verdict = 'Suspicious';
  if (score >= 70) verdict = 'Likely Authentic';
  if (score <= 40) verdict = 'Potentially Fake';
  
  return { score, verdict, reasoning };
}
```

---

## ⚡ Performance Optimization

### Image Processing Optimization

**1. Image Resizing**:
```typescript
// Resize large images to reduce processing time
const MAX_DIMENSION = 2048;

function resizeIfNeeded(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  
  if (img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION) {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    return canvas;
  }
  
  const scale = Math.min(
    MAX_DIMENSION / img.width,
    MAX_DIMENSION / img.height
  );
  
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return canvas;
}
```

**2. Parallel Processing**:
```typescript
// Run all analyses in parallel
const [exifData, elaResult, fftResult, reverseSearchResult] = await Promise.all([
  extractExifData(file),
  analyzeImageELA(file),
  analyzeImageFFT(file),
  reverseImageSearch(imageBase64),
]);
```

**3. Web Workers** (Future Enhancement):
```typescript
// Offload heavy computations to Web Workers
const worker = new Worker('fft-worker.js');
worker.postMessage({ imageData, size });
const fftResult = await new Promise(resolve => {
  worker.onmessage = (e) => resolve(e.data);
});
```

### Caching Strategy

```typescript
// Cache processed results
const cache = new Map<string, AnalysisResult>();

async function analyzeWithCache(file: File): Promise<AnalysisResult> {
  const hash = await calculateFileHash(file);
  
  if (cache.has(hash)) {
    return cache.get(hash)!;
  }
  
  const result = await analyze(file);
  cache.set(hash, result);
  
  return result;
}
```

---

## 📊 API Specifications

### Edge Function: `analyze-content`

**Endpoint**: `POST /functions/v1/analyze-content`

**Request**:
```json
{
  "type": "image" | "video" | "text",
  "content": "base64_encoded_content",
  "url": "optional_url_for_url_analysis"
}
```

**Response**:
```json
{
  "score": 75,
  "verdict": "Likely Authentic",
  "confidence": 0.85,
  "reasoning": [
    "EXIF data indicates camera origin",
    "Compression patterns consistent with single save",
    "Image found on reputable news sources"
  ],
  "breakdown": {
    "exif": { "score": 80, "details": "..." },
    "ela": { "score": 70, "details": "..." },
    "fft": { "score": 75, "details": "..." },
    "reverseSearch": { "score": 80, "details": "..." }
  },
  "timestamp": "2025-01-09T12:00:00Z"
}
```

### Edge Function: `reverse-search`

**Endpoint**: `POST /functions/v1/reverse-search`

**Request**:
```json
{
  "image": "base64_encoded_image"
}
```

**Response**: See `ReverseSearchResult` interface above.

---

<div align="center">

**[Back to Main README](../README.md)** | **[API Docs](./API.md)** | **[Architecture](./ARCHITECTURE.md)**

</div>
