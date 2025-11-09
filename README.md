# RealityRadar - Deepfake Detector

<div align="center">

![RealityRadar](https://img.shields.io/badge/RealityRadar-v1.0-blue)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Powered-green)

**Advanced AI-powered deepfake detection for images, videos, and text**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Chrome Extension](#chrome-extension) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Chrome Extension](#chrome-extension)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Security & Privacy](#security--privacy)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🎯 Overview

**RealityRadar** is a cutting-edge deepfake detection platform that combines multiple advanced analysis techniques to identify manipulated media content. With support for images, videos, and text, RealityRadar provides comprehensive protection against digital deception.

### Why RealityRadar?

- 🔍 **Multi-Modal Analysis**: Detects deepfakes in images, videos, and text
- 🧠 **AI-Powered**: Leverages Google Vision API and custom ML algorithms
- 🔬 **Technical Analysis**: EXIF, ELA, FFT, and metadata inspection
- 🌐 **Reverse Image Search**: Verifies content authenticity across the web
- 🎓 **Educational**: Interactive quiz and learning resources
- 🚀 **Fast & Accurate**: Real-time analysis with detailed reports
- 🔒 **Privacy-First**: Secure processing with no data retention
- 💻 **Cross-Platform**: Web app and Chrome extension

---

## ✨ Features

### Core Detection Capabilities

#### 🖼️ Image Analysis
- **EXIF Metadata Extraction**: Detects software manipulation signatures
- **Error Level Analysis (ELA)**: Identifies compression inconsistencies
- **Fast Fourier Transform (FFT)**: Analyzes frequency patterns for AI generation detection
- **Reverse Image Search**: Cross-references images across the web using Google Vision API
- **AI Pattern Recognition**: Detects common deepfake artifacts

#### 🎥 Video Analysis
- **Frame-by-Frame Analysis**: Examines video integrity across frames
- **Temporal Consistency Check**: Identifies unnatural transitions
- **Audio-Visual Sync Detection**: Detects lip-sync anomalies
- **Metadata Inspection**: Analyzes video file metadata

#### 📝 Text Analysis
- **AI Writing Pattern Detection**: Identifies AI-generated text
- **Linguistic Analysis**: Checks for unnatural language patterns
- **Source Verification**: Cross-references text content

### Additional Features

#### 🎮 Interactive Quiz
- Test your deepfake detection skills
- Real deepfake vs. authentic content challenges
- Educational feedback and explanations
- Progress tracking

#### 📚 Educational Resources
- Comprehensive deepfake education section
- Best practices for content verification
- Stay informed about latest threats

#### 🔐 Security & Privacy
- End-to-end encrypted analysis
- No persistent storage of uploaded content
- Secure API communication
- GDPR compliant

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React components

### Backend & Services
- **Lovable Cloud** - Serverless backend infrastructure
- **Supabase** - Database and authentication
- **Edge Functions** - Serverless API endpoints
- **Google Vision API** - Reverse image search

### Analysis Libraries
- **exifr** - EXIF metadata extraction
- **heic2any** - HEIC image conversion
- **Custom algorithms** - FFT and ELA implementation

### Browser Extension
- **Manifest V3** - Modern Chrome extension format
- **Memory Router** - Client-side routing for popup
- **Optimized Bundle** - Compact size for quick loading

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** package manager
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd realityradar

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:8080`

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

> **Note**: These are auto-configured for Lovable Cloud projects

---

## 🌐 Chrome Extension

RealityRadar is also available as a Chrome extension for quick, on-the-go deepfake detection.

### Installation

1. **Build the extension**:
   ```bash
   npm run build
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### Features
- Quick analysis from browser toolbar
- Compact, optimized UI (400x500px)
- File upload or URL analysis
- Instant results display

### Publishing
See [CHROME_EXTENSION.md](./CHROME_EXTENSION.md) for detailed publishing instructions.

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Local Development Setup](./LOCAL_SETUP.md)** - Detailed local development guide
- **[Technical Documentation](./docs/TECHNICAL.md)** - Deep dive into algorithms and analysis
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System design and component overview
- **[API Documentation](./docs/API.md)** - Edge functions and API endpoints
- **[Development Guide](./docs/DEVELOPMENT.md)** - Contributing and development workflow
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Chrome Extension Guide](./CHROME_EXTENSION.md)** - Extension-specific documentation

---

## 📁 Project Structure

```
realityradar/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── FileUpload.tsx  # File upload interface
│   │   ├── AnalysisResult.tsx
│   │   ├── DeepfakeQuiz.tsx
│   │   └── DeepfakeEducation.tsx
│   ├── pages/              # Application pages
│   │   ├── Index.tsx       # Main application page
│   │   └── NotFound.tsx
│   ├── utils/              # Utility functions
│   │   ├── exifExtractor.ts    # EXIF metadata analysis
│   │   ├── elaAnalyzer.ts      # Error Level Analysis
│   │   └── fftAnalyzer.ts      # FFT analysis
│   ├── integrations/       # External integrations
│   │   └── supabase/       # Supabase client
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Library utilities
│   └── assets/             # Static assets
├── supabase/
│   ├── functions/          # Edge functions
│   │   ├── analyze-content/    # Main analysis API
│   │   └── reverse-search/     # Reverse image search
│   └── config.toml         # Supabase configuration
├── public/                 # Public static files
│   ├── manifest.json       # Chrome extension manifest
│   └── robots.txt
├── docs/                   # Documentation
└── dist/                   # Build output (Chrome extension)
```

---

## 🔒 Security & Privacy

### Data Handling
- ✅ **No Persistent Storage**: Uploaded content is processed and immediately discarded
- ✅ **Encrypted Transmission**: All API calls use HTTPS
- ✅ **Secure Processing**: Analysis runs in isolated serverless functions
- ✅ **No Third-Party Sharing**: Your data stays within the analysis pipeline

### Privacy Policy
- No personal data collection
- No tracking or analytics on uploaded content
- Anonymous usage statistics only (optional)
- GDPR and CCPA compliant

### Security Measures
- Content Security Policy (CSP) enforcement
- XSS protection
- CSRF protection
- Regular security audits
- Dependency vulnerability scanning

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- 🧪 Add test cases
- 🎨 Improve UI/UX

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed contribution guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 💬 Support

### Get Help
- 📧 **Email**: support@realityradar.app
- 💬 **Discord**: [Join our community](https://discord.gg/realityradar)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/realityradar/issues)
- 📖 **Documentation**: [Full Docs](./docs/)

### Stay Updated
- 🌟 Star this repository
- 👀 Watch for updates
- 🐦 Follow us on Twitter: [@RealityRadar](https://twitter.com/realityradar)
- 📰 Read our blog: [blog.realityradar.app](https://blog.realityradar.app)

---

## 🙏 Acknowledgments

- **Lovable** - For the amazing development platform
- **Supabase** - For backend infrastructure
- **Google Vision API** - For reverse image search capabilities
- **shadcn/ui** - For beautiful UI components
- **Open Source Community** - For inspiration and support

---

<div align="center">

**Built with ❤️ by the RealityRadar Team**

[Website](https://realityradar.app) • [Documentation](./docs/) • [Chrome Extension](./CHROME_EXTENSION.md)

</div>
