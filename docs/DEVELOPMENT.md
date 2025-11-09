# Development Guide

Contributing guidelines, workflow, and best practices for RealityRadar development.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Development Environment Set Up**
   - See [LOCAL_SETUP.md](../LOCAL_SETUP.md) for detailed instructions
   - Node.js v18+
   - Git configured

2. **Familiarity with Tech Stack**
   - React & TypeScript
   - Tailwind CSS
   - Supabase / Edge Functions (Deno)
   - Basic image processing concepts

3. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/realityradar.git
   cd realityradar
   
   # Add upstream remote
   git remote add upstream https://github.com/original/realityradar.git
   ```

---

## 💻 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch Naming Convention**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Changes

```bash
# Start development server
npm run dev

# Make your changes in your code editor
# Test changes in browser at http://localhost:8080
```

### 3. Test Locally

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Build to ensure no build errors
npm run build

# Test production build
npm run preview
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add ELA heatmap zoom feature"
```

**Commit Message Format**:
```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```bash
git commit -m "feat: add support for HEIC image format"
git commit -m "fix: correct FFT calculation for edge pixels"
git commit -m "docs: update API documentation with new endpoints"
git commit -m "refactor: extract EXIF parsing into separate utility"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Open PR on GitHub
# Fill out PR template
```

---

## 🎨 Code Style

### TypeScript Guidelines

**1. Use TypeScript Features**

```typescript
// ✅ Good: Explicit types
interface AnalysisResult {
  score: number;
  verdict: string;
}

function analyze(file: File): Promise<AnalysisResult> {
  // ...
}

// ❌ Bad: Using 'any'
function analyze(file: any): any {
  // ...
}
```

**2. Prefer Interfaces over Types** (for objects)

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

// ⚠️ Use type for unions/intersections
type Status = 'active' | 'inactive';
```

**3. Use Strict Null Checks**

```typescript
// ✅ Good: Handle null/undefined
function getUser(id: string): User | null {
  // ...
}

const user = getUser('123');
if (user) {
  console.log(user.name);
}

// ❌ Bad: Assume non-null
const user = getUser('123');
console.log(user.name); // Could crash!
```

### React Guidelines

**1. Functional Components with Hooks**

```typescript
// ✅ Good
export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [file, setFile] = useState<File | null>(null);
  
  return (
    // JSX
  );
};

// ❌ Bad: Class components (legacy)
class FileUpload extends React.Component {
  // ...
}
```

**2. Meaningful Component Names**

```typescript
// ✅ Good: Descriptive
<AnalysisResultDisplay result={result} />

// ❌ Bad: Vague
<ResultDisplay data={result} />
```

**3. Extract Complex Logic to Custom Hooks**

```typescript
// ✅ Good
function useImageAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  const analyze = async (file: File) => {
    setLoading(true);
    // ... analysis logic
    setLoading(false);
  };
  
  return { result, loading, analyze };
}

// Use in component
const { result, loading, analyze } = useImageAnalysis();
```

**4. Avoid Prop Drilling**

```typescript
// ✅ Good: Use context for deeply nested props
const ThemeContext = React.createContext<Theme>('light');

// ❌ Bad: Passing props through 5+ levels
<Parent theme={theme}>
  <Child theme={theme}>
    <GrandChild theme={theme}>
      // ...
    </GrandChild>
  </Child>
</Parent>
```

### CSS/Tailwind Guidelines

**1. Use Semantic Tokens**

```tsx
// ✅ Good: Semantic tokens
<div className="bg-background text-foreground border-border">

// ❌ Bad: Direct colors
<div className="bg-white text-black border-gray-300">
```

**2. Group Related Classes**

```tsx
// ✅ Good: Logical grouping
<button className="
  px-4 py-2 rounded-lg
  bg-primary text-primary-foreground
  hover:bg-primary/90
  transition-colors
">

// ❌ Bad: Random order
<button className="text-primary-foreground bg-primary rounded-lg transition-colors hover:bg-primary/90 py-2 px-4">
```

**3. Extract Repeated Patterns to Components**

```tsx
// ✅ Good: Reusable component
const Badge = ({ variant, children }) => (
  <span className={cn(
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs",
    variants[variant]
  )}>
    {children}
  </span>
);

// ❌ Bad: Repeated classes everywhere
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-primary text-primary-foreground">
  Badge 1
</span>
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-success text-success-foreground">
  Badge 2
</span>
```

### File Organization

```
src/
├── components/
│   ├── ui/              # Generic UI components (shadcn)
│   ├── AnalysisResult.tsx    # Feature components
│   └── FileUpload.tsx
├── pages/               # Route pages
├── utils/               # Pure utility functions
├── hooks/               # Custom React hooks
├── lib/                 # External integrations
└── types/               # TypeScript type definitions
```

**Naming**:
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `useCamelCase.ts`
- Types: `PascalCase.ts` or in component file

---

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] **Image Upload**
  - Drag and drop
  - File picker
  - URL input
  - HEIC format
  - Large files (>5MB)
  - Invalid files (non-images)

- [ ] **Analysis Features**
  - EXIF extraction
  - ELA heatmap generation
  - FFT analysis
  - Reverse image search
  - Score calculation
  - Result display

- [ ] **Chrome Extension**
  - Extension builds successfully
  - Popup opens correctly
  - File upload works
  - Results display properly
  - No console errors

- [ ] **Responsive Design**
  - Desktop (1920x1080)
  - Laptop (1366x768)
  - Tablet (768x1024)
  - Mobile (375x667)

- [ ] **Browser Compatibility**
  - Chrome
  - Firefox
  - Safari (if possible)
  - Edge

### Automated Testing (Future)

```typescript
// Example unit test (to be implemented)
describe('EXIF Extraction', () => {
  it('should extract camera make and model', async () => {
    const file = await loadTestImage('camera-photo.jpg');
    const exif = await extractExifData(file);
    
    expect(exif.camera).toBe('Canon EOS 5D Mark IV');
  });
  
  it('should detect editing software', async () => {
    const file = await loadTestImage('edited-photo.jpg');
    const exif = await extractExifData(file);
    
    expect(exif.hasBeenModified).toBe(true);
    expect(exif.software).toContain('Photoshop');
  });
});
```

---

## 🌿 Git Workflow

### Branching Strategy

```
main (production)
  ↓
develop (staging)
  ↓
feature/your-feature
```

### Keeping Your Branch Updated

```bash
# While on your feature branch
git fetch upstream
git rebase upstream/main

# Resolve conflicts if any
# Then force push (only to your fork!)
git push origin feature/your-feature --force
```

### Before Submitting PR

```bash
# Ensure you're up to date with main
git checkout main
git pull upstream main

# Rebase your feature branch
git checkout feature/your-feature
git rebase main

# Squash commits if needed (interactive rebase)
git rebase -i HEAD~3  # Squash last 3 commits

# Run final checks
npm run lint
npm run build

# Push
git push origin feature/your-feature
```

---

## 🔄 Pull Request Process

### 1. Before Opening PR

- [ ] Code follows style guidelines
- [ ] All lint errors fixed
- [ ] Build succeeds
- [ ] Manual testing completed
- [ ] Commits are clean and descriptive
- [ ] Branch is up to date with main

### 2. PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List key changes
- Be specific

## Testing
- [ ] Manual testing completed
- [ ] Chrome extension tested (if applicable)
- [ ] Edge functions tested (if applicable)

## Screenshots
(If UI changes, add before/after screenshots)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Responsive design verified
```

### 3. Review Process

**What Reviewers Look For**:
- Code quality and readability
- Adherence to style guide
- Potential bugs or edge cases
- Performance implications
- Security concerns
- Test coverage

**Responding to Feedback**:
```bash
# Make requested changes
git add .
git commit -m "fix: address review feedback"

# Push to update PR
git push origin feature/your-feature
```

### 4. After Approval

- Wait for maintainer to merge
- Delete your feature branch after merge:
  ```bash
  git branch -d feature/your-feature
  git push origin --delete feature/your-feature
  ```

---

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (v2.0.0)
- **MINOR**: New features (v1.1.0)
- **PATCH**: Bug fixes (v1.0.1)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Chrome extension published (if applicable)

### Creating a Release

```bash
# Update version
npm version patch  # or minor, or major

# Push with tags
git push --follow-tags

# Create GitHub release
# - Go to GitHub Releases
# - Create new release
# - Use tag created by npm version
# - Add release notes from CHANGELOG.md
```

---

## 📝 Documentation Standards

### Code Comments

```typescript
// ✅ Good: Explain WHY, not WHAT
// Use power-of-2 for FFT efficiency
const SIZE = 256;

// Calculate high-frequency ratio to detect AI generation patterns
// Natural photos typically have ratio 0.3-0.5
const ratio = calculateHighFrequencyRatio(fftData);

// ❌ Bad: Obvious comments
// Create variable
const SIZE = 256;

// Call function
const ratio = calculateHighFrequencyRatio(fftData);
```

### JSDoc for Functions

```typescript
/**
 * Extracts EXIF metadata from an image file.
 * 
 * @param file - The image file to analyze
 * @returns Promise resolving to EXIF data, or undefined if no EXIF found
 * @throws Error if file is not a valid image
 * 
 * @example
 * ```typescript
 * const file = input.files[0];
 * const exif = await extractExifData(file);
 * console.log(exif.camera); // "Canon EOS 5D"
 * ```
 */
export async function extractExifData(file: File): Promise<ExifData | undefined> {
  // Implementation
}
```

### README Updates

When adding features, update:
- Main [README.md](../README.md) - High-level overview
- [TECHNICAL.md](./TECHNICAL.md) - Algorithm details
- [API.md](./API.md) - Endpoint documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design changes

---

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the code, not the person

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Discord**: Real-time chat (if available)

### Asking Good Questions

```markdown
## Good Question Template

**What I'm trying to do:**
I want to add support for analyzing GIF images.

**What I've tried:**
- Modified FileUpload to accept .gif
- Tested with sample GIF file
- Analysis fails at EXIF extraction step

**Error message:**
```
TypeError: Cannot read property 'Make' of undefined
```

**Environment:**
- Node.js v18.12.0
- Chrome 120
- macOS Ventura

**Question:**
Does the exifr library support GIF format? Should I skip EXIF for GIFs?
```

---

## 🎯 Feature Development Guidelines

### Before Starting a Feature

1. **Check existing issues** - Someone might be working on it
2. **Open an issue** - Discuss approach before coding
3. **Get approval** - Wait for maintainer feedback
4. **Plan architecture** - Think through implementation

### Feature Implementation Process

1. **Start small** - MVP first, improvements later
2. **Write clean code** - Follow style guide
3. **Test thoroughly** - Manual + automated (if applicable)
4. **Document changes** - Update relevant docs
5. **Get feedback early** - Open draft PR for discussion

### Example: Adding New Analysis Algorithm

```typescript
// 1. Create utility file
// src/utils/newAlgorithm.ts

/**
 * Performs new analysis technique on image.
 */
export async function analyzeImageNew(file: File): Promise<NewAnalysisResult> {
  // Implementation
}

// 2. Add to main analysis pipeline
// src/pages/Index.tsx

const [newResult, setNewResult] = useState<NewAnalysisResult | null>(null);

const handleAnalyze = async () => {
  const [exif, ela, fft, newAnalysis] = await Promise.all([
    extractExifData(file),
    analyzeImageELA(file),
    analyzeImageFFT(file),
    analyzeImageNew(file),  // Add new analysis
  ]);
  
  // Aggregate results
};

// 3. Update UI to display results
// src/components/AnalysisResult.tsx

<AccordionItem value="new">
  <AccordionTrigger>New Analysis</AccordionTrigger>
  <AccordionContent>
    <p>Score: {result.newAnalysis.score}</p>
    <p>{result.newAnalysis.details}</p>
  </AccordionContent>
</AccordionItem>

// 4. Update documentation
// docs/TECHNICAL.md - Add algorithm explanation
// README.md - Mention new feature
```

---

<div align="center">

**Happy Contributing! 🚀**

[Back to Main README](../README.md) | [Technical Docs](./TECHNICAL.md) | [Architecture](./ARCHITECTURE.md)

</div>
