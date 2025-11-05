export interface FFTAnalysisResult {
  highFrequencyRatio: number;
  isAiGenerated: boolean;
  confidence: number;
  details: string;
  spectralAnomaly: number;
}

export async function analyzeImageFFT(file: File): Promise<FFTAnalysisResult | null> {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          // Resize to 256x256 for faster FFT computation
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);

          const imageData = ctx.getImageData(0, 0, size, size);
          const grayscale = convertToGrayscale(imageData);

          // Perform 2D FFT analysis
          const fftResult = compute2DFFT(grayscale, size);
          
          // Calculate high-frequency energy ratio
          const highFreqRatio = calculateHighFrequencyRatio(fftResult, size);
          
          // Calculate spectral anomaly score
          const spectralAnomaly = calculateSpectralAnomaly(fftResult, size);

          // AI-generated images typically have < 0.15 high-frequency ratio
          // Natural photos have > 0.20 due to sensor noise
          const isAiGenerated = highFreqRatio < 0.15;
          const confidence = Math.abs(highFreqRatio - 0.15) * 5; // Scale to 0-1

          let details = '';
          if (highFreqRatio < 0.12) {
            details = 'ALTA probabilità AI: Frequenze alte quasi assenti (tipico di GANs/Diffusion models). ';
          } else if (highFreqRatio < 0.15) {
            details = 'MEDIA probabilità AI: Pattern di rumore sospettosamente uniforme. ';
          } else if (highFreqRatio < 0.20) {
            details = 'BASSA probabilità AI: Alcune frequenze alte presenti ma sotto media fotocamere. ';
          } else {
            details = 'Probabilmente REALE: Rumore ad alta frequenza compatibile con sensore fotocamera. ';
          }

          if (spectralAnomaly > 0.3) {
            details += `Anomalia spettrale rilevata (${spectralAnomaly.toFixed(2)}): distribuzione frequenze innaturale.`;
          }

          resolve({
            highFrequencyRatio: highFreqRatio,
            isAiGenerated,
            confidence: Math.min(confidence, 1),
            details,
            spectralAnomaly
          });
        };

        img.onerror = () => resolve(null);
        img.src = e.target?.result as string;
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('FFT Analysis error:', error);
    return null;
  }
}

function convertToGrayscale(imageData: ImageData): number[] {
  const data = imageData.data;
  const grayscale: number[] = [];
  
  for (let i = 0; i < data.length; i += 4) {
    // Luminance formula
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    grayscale.push(gray);
  }
  
  return grayscale;
}

function compute2DFFT(data: number[], size: number): number[][] {
  // Simplified 2D FFT using row-column algorithm
  const freq: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  
  // Row-wise FFT (simplified DFT for demonstration)
  for (let y = 0; y < size; y++) {
    for (let u = 0; u < size; u++) {
      let real = 0;
      let imag = 0;
      
      for (let x = 0; x < size; x++) {
        const angle = -2 * Math.PI * u * x / size;
        const value = data[y * size + x];
        real += value * Math.cos(angle);
        imag += value * Math.sin(angle);
      }
      
      freq[y][u] = Math.sqrt(real * real + imag * imag) / size;
    }
  }
  
  // Column-wise FFT
  const freq2: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  for (let x = 0; x < size; x++) {
    for (let v = 0; v < size; v++) {
      let real = 0;
      let imag = 0;
      
      for (let y = 0; y < size; y++) {
        const angle = -2 * Math.PI * v * y / size;
        const value = freq[y][x];
        real += value * Math.cos(angle);
        imag += value * Math.sin(angle);
      }
      
      freq2[v][x] = Math.sqrt(real * real + imag * imag) / size;
    }
  }
  
  return freq2;
}

function calculateHighFrequencyRatio(fftData: number[][], size: number): number {
  const center = size / 2;
  const highFreqThreshold = size / 4; // High frequency region
  
  let totalEnergy = 0;
  let highFreqEnergy = 0;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt(Math.pow(x - center, 2) + Math.pow(y - center, 2));
      const energy = fftData[y][x] * fftData[y][x];
      
      totalEnergy += energy;
      
      if (dist > highFreqThreshold) {
        highFreqEnergy += energy;
      }
    }
  }
  
  return totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
}

function calculateSpectralAnomaly(fftData: number[][], size: number): number {
  const center = size / 2;
  
  // Calculate radial average
  const radialBins = 50;
  const radialAvg: number[] = Array(radialBins).fill(0);
  const radialCount: number[] = Array(radialBins).fill(0);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt(Math.pow(x - center, 2) + Math.pow(y - center, 2));
      const bin = Math.min(Math.floor(dist / (size / 2) * radialBins), radialBins - 1);
      
      radialAvg[bin] += fftData[y][x];
      radialCount[bin]++;
    }
  }
  
  // Normalize
  for (let i = 0; i < radialBins; i++) {
    if (radialCount[i] > 0) {
      radialAvg[i] /= radialCount[i];
    }
  }
  
  // Calculate anomaly: deviation from expected natural decay
  let anomaly = 0;
  for (let i = 1; i < radialBins - 1; i++) {
    const expected = radialAvg[i - 1] * 0.95; // Natural images decay ~5% per bin
    const deviation = Math.abs(radialAvg[i] - expected) / (expected + 1);
    anomaly += deviation;
  }
  
  return anomaly / radialBins;
}
