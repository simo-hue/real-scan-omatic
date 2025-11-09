# Architecture Documentation

System design, component structure, and architectural decisions for RealityRadar.

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Component Structure](#component-structure)
- [State Management](#state-management)
- [Security Architecture](#security-architecture)

---

## 🏗️ System Overview

RealityRadar follows a modern serverless architecture with clear separation between frontend and backend concerns.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Extension                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Application (SPA)                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Pages   │  │Components│  │  Utils   │          │   │
│  │  │          │  │          │  │          │          │   │
│  │  │ • Index  │  │• Upload  │  │• EXIF    │          │   │
│  │  │ • Quiz   │  │• Results │  │• ELA     │          │   │
│  │  │ • Edu    │  │• Quiz    │  │• FFT     │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            │ HTTPS / WebSocket               │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                   Lovable Cloud / Supabase                   │
├────────────────────────────┼─────────────────────────────────┤
│                            │                                 │
│  ┌─────────────────────────▼──────────────────────────────┐ │
│  │              Edge Functions (Deno Runtime)             │ │
│  │  ┌───────────────────┐    ┌──────────────────────┐    │ │
│  │  │ analyze-content   │    │  reverse-search      │    │ │
│  │  │                   │    │                      │    │ │
│  │  │ • Orchestrator    │    │ • Google Vision API  │    │ │
│  │  │ • AI Analysis     │    │ • Web Detection      │    │ │
│  │  │ • Aggregation     │    │ • Entity Recognition │    │ │
│  │  └───────────────────┘    └──────────────────────┘    │ │
│  └──────────────────────────────────────────────────────┘ │
│                            │                                 │
│  ┌─────────────────────────▼──────────────────────────────┐ │
│  │              PostgreSQL Database                       │ │
│  │  • User data (if auth enabled)                         │ │
│  │  • Analysis history (optional)                         │ │
│  │  • Quiz results                                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Storage Buckets                       │  │
│  │  • Temporary file storage                             │  │
│  │  • Heatmap generation cache                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                   External Services                          │
├────────────────────────────┼─────────────────────────────────┤
│                            │                                 │
│  ┌─────────────────────────▼──────────────────────────────┐ │
│  │              Google Vision API                         │ │
│  │  • Web Detection                                       │ │
│  │  • Entity Recognition                                  │ │
│  │  • Reverse Image Search                                │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18.3 | UI library |
| | TypeScript | Type safety |
| | Vite | Build tool & dev server |
| | Tailwind CSS | Styling |
| | shadcn/ui | Component library |
| **Backend** | Lovable Cloud (Supabase) | Serverless platform |
| | Deno | Edge function runtime |
| | PostgreSQL | Database |
| **External** | Google Vision API | Reverse image search |
| **Analysis** | exifr | EXIF extraction |
| | heic2any | Image conversion |
| | Custom algorithms | ELA, FFT |

---

## 🖥️ Frontend Architecture

### Component Hierarchy

```
App.tsx
└── MemoryRouter (Extension) / BrowserRouter (Web)
    └── Routes
        ├── Index (/)
        │   ├── FileUpload
        │   │   ├── Tabs
        │   │   │   ├── FileUploadTab
        │   │   │   └── URLUploadTab
        │   │   └── DragDropZone
        │   ├── AnalysisResult
        │   │   ├── ScoreDisplay
        │   │   ├── VerdictBadge
        │   │   ├── ReasoningList
        │   │   └── BreakdownAccordion
        │   ├── DeepfakeQuiz
        │   │   ├── QuestionCard
        │   │   ├── ImageComparison
        │   │   └── ScoreCard
        │   └── DeepfakeEducation
        │       └── AccordionSections
        └── NotFound (*)
```

### Page Structure

#### `src/pages/Index.tsx`

Main application page with tab-based navigation:

```typescript
export default function Index() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header>{/* Header content */}</header>
      
      <main>
        <Tabs defaultValue="upload">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <FileUpload onFileSelect={setSelectedFile} />
            <Button onClick={handleAnalyze}>Analyze</Button>
          </TabsContent>
          
          <TabsContent value="results">
            <AnalysisResult result={analysisResult} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
```

### Component Design Patterns

#### 1. Composition Pattern

Components are composed for maximum reusability:

```typescript
// FileUpload.tsx
export const FileUpload = ({ onFileSelect }: FileUploadProps) => (
  <Tabs>
    <TabsList>
      <TabsTrigger value="file">File</TabsTrigger>
      <TabsTrigger value="url">URL</TabsTrigger>
    </TabsList>
    <TabsContent value="file">
      <FileUploadTab onSelect={onFileSelect} />
    </TabsContent>
    <TabsContent value="url">
      <URLUploadTab onSelect={onFileSelect} />
    </TabsContent>
  </Tabs>
);
```

#### 2. Custom Hooks Pattern

Reusable logic extracted into hooks:

```typescript
// useAnalysis.ts
export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const analyze = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const [exif, ela, fft] = await Promise.all([
        extractExifData(file),
        analyzeImageELA(file),
        analyzeImageFFT(file),
      ]);
      
      const aggregated = aggregateResults({ exif, ela, fft });
      setResult(aggregated);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return { analyze, isAnalyzing, result };
}
```

#### 3. Render Props Pattern

For flexible rendering logic:

```typescript
// AnalysisResult.tsx
<BreakdownAccordion
  items={breakdown}
  renderItem={(item) => (
    <div>
      <h3>{item.name}</h3>
      <p>Score: {item.score}</p>
    </div>
  )}
/>
```

### Styling Architecture

#### Design System

All colors, spacing, and typography defined in semantic tokens:

```css
/* src/index.css */
:root {
  /* Semantic colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  
  /* Component-specific */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  
  /* Analysis-specific */
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --danger: 0 84% 60%;
}
```

#### Component Variants

Using `class-variance-authority` for type-safe variants:

```typescript
// src/components/ui/badge.tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        danger: "bg-danger/10 text-danger",
      },
    },
  }
);
```

---

## ⚙️ Backend Architecture

### Edge Functions

#### Function: `analyze-content`

**Purpose**: Main analysis orchestrator

**Location**: `supabase/functions/analyze-content/index.ts`

```typescript
Deno.serve(async (req) => {
  // 1. Parse request
  const { type, content, url } = await req.json();
  
  // 2. Validate input
  if (!type || (!content && !url)) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400 }
    );
  }
  
  // 3. Route to appropriate analyzer
  let result;
  switch (type) {
    case 'image':
      result = await analyzeImage(content || url);
      break;
    case 'video':
      result = await analyzeVideo(content || url);
      break;
    case 'text':
      result = await analyzeText(content);
      break;
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid type' }),
        { status: 400 }
      );
  }
  
  // 4. Return result
  return new Response(
    JSON.stringify(result),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
});
```

#### Function: `reverse-search`

**Purpose**: Google Vision API integration

**Flow**:
```
Client Request
    ↓
Extract base64 image
    ↓
Call Google Vision API
    ↓
Parse web detection results
    ↓
Extract entities & matches
    ↓
Format response
    ↓
Return to client
```

### Database Schema

```sql
-- Users table (if auth enabled)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis history (optional feature)
CREATE TABLE IF NOT EXISTS public.analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  file_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  verdict TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz results
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own history"
  ON public.analysis_history FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = analysis_history.user_id));
```

---

## 🔄 Data Flow

### Image Analysis Flow

```
┌──────────────┐
│   User       │
│  Selects     │
│   Image      │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  FileUpload      │
│  Component       │
│  • Validates     │
│  • Converts HEIC │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│          Parallel Analysis (Client)          │
├──────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │  EXIF   │  │   ELA   │  │   FFT   │     │
│  │Extract  │  │ Analyze │  │ Analyze │     │
│  └────┬────┘  └────┬────┘  └────┬────┘     │
└───────┼────────────┼────────────┼───────────┘
        │            │            │
        └────────────┴────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Convert to Base64     │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Call Edge Function    │
        │  /analyze-content      │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Call Edge Function    │
        │  /reverse-search       │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Google Vision API     │
        │  Web Detection         │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Aggregate Results     │
        │  • Calculate Score     │
        │  • Determine Verdict   │
        │  • Generate Reasoning  │
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Display Results       │
        │  • Score Badge         │
        │  • Detailed Breakdown  │
        │  • Visualizations      │
        └────────────────────────┘
```

### State Management Flow

```
┌─────────────────────────────────────────┐
│         Component State (useState)       │
├─────────────────────────────────────────┤
│  • selectedFile                          │
│  • analysisResult                        │
│  • isAnalyzing                           │
│  • error                                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      React Query (Future)                │
├─────────────────────────────────────────┤
│  • Caching                               │
│  • Background refetch                    │
│  • Optimistic updates                    │
└─────────────────────────────────────────┘
```

---

## 🔒 Security Architecture

### Content Security Policy

```json
// public/manifest.json (Chrome Extension)
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### API Security

**Edge Functions**:
- CORS headers configured
- Request validation
- Rate limiting (Supabase built-in)
- API key protection (environment variables)

**Client-Side**:
- No sensitive data in localStorage
- Secure file handling
- HTTPS-only communication

### Data Privacy

- **No persistent storage**: Files deleted after analysis
- **Temporary processing**: Results not saved (unless opt-in)
- **Encrypted transmission**: HTTPS/TLS for all API calls
- **No third-party tracking**: Analytics anonymized

---

## 🎯 Design Decisions

### Why Edge Functions?

**Advantages**:
- ✅ Scalable: Auto-scales with traffic
- ✅ Cost-effective: Pay per execution
- ✅ Fast: Deployed globally
- ✅ Secure: Isolated execution
- ✅ Easy deployment: Git push to deploy

**Tradeoffs**:
- ❌ Cold start latency (~100-500ms)
- ❌ Limited execution time (60s)
- ❌ No persistent state

### Why Client-Side Analysis for EXIF/ELA/FFT?

**Advantages**:
- ✅ Instant results (no network round-trip)
- ✅ Privacy: Data never leaves device
- ✅ Reduced server cost
- ✅ Works offline

**Tradeoffs**:
- ❌ Larger bundle size
- ❌ Performance varies by device
- ❌ Limited to browser capabilities

### Why Reverse Search on Server?

**Reasoning**:
- API key protection
- Rate limit management
- Consistent performance
- Result caching potential

---

<div align="center">

**[Back to Main README](../README.md)** | **[Technical Docs](./TECHNICAL.md)** | **[API Docs](./API.md)**

</div>
