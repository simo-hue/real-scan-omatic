export interface ELAAnalysisResult {
  heatmapDataUrl: string;
  suspiciousZones: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    intensity: number;
  }>;
  overallScore: number;
  details: string;
}

export async function analyzeImageELA(file: File): Promise<ELAAnalysisResult | null> {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = async () => {
          // Create canvas for original image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Recompress at quality 95%
          const recompressedBlob = await new Promise<Blob | null>((res) => {
            canvas.toBlob((blob) => res(blob), 'image/jpeg', 0.95);
          });

          if (!recompressedBlob) {
            resolve(null);
            return;
          }

          // Load recompressed image
          const recompressedUrl = URL.createObjectURL(recompressedBlob);
          const recompressedImg = new Image();

          recompressedImg.onload = () => {
            const recompCtx = canvas.getContext('2d');
            if (!recompCtx) {
              URL.revokeObjectURL(recompressedUrl);
              resolve(null);
              return;
            }

            recompCtx.clearRect(0, 0, canvas.width, canvas.height);
            recompCtx.drawImage(recompressedImg, 0, 0);
            const recompressedData = recompCtx.getImageData(0, 0, canvas.width, canvas.height);

            // Calculate ELA (pixel differences)
            const elaData = ctx.createImageData(canvas.width, canvas.height);
            const differences: number[] = [];
            let maxDiff = 0;

            for (let i = 0; i < originalData.data.length; i += 4) {
              const rDiff = Math.abs(originalData.data[i] - recompressedData.data[i]);
              const gDiff = Math.abs(originalData.data[i + 1] - recompressedData.data[i + 1]);
              const bDiff = Math.abs(originalData.data[i + 2] - recompressedData.data[i + 2]);
              
              const avgDiff = (rDiff + gDiff + bDiff) / 3;
              differences.push(avgDiff);
              maxDiff = Math.max(maxDiff, avgDiff);
            }

            // Normalize and create heatmap
            const scale = maxDiff > 0 ? 255 / maxDiff : 1;
            for (let i = 0; i < differences.length; i++) {
              const normalized = differences[i] * scale * 3; // Amplify for visibility
              const clamped = Math.min(255, normalized);
              
              // Heatmap color: blue (low) -> red (high)
              const pixelIndex = i * 4;
              if (clamped < 128) {
                elaData.data[pixelIndex] = 0;
                elaData.data[pixelIndex + 1] = clamped * 2;
                elaData.data[pixelIndex + 2] = 255 - clamped * 2;
              } else {
                elaData.data[pixelIndex] = (clamped - 128) * 2;
                elaData.data[pixelIndex + 1] = 255 - (clamped - 128) * 2;
                elaData.data[pixelIndex + 2] = 0;
              }
              elaData.data[pixelIndex + 3] = 255;
            }

            ctx.putImageData(elaData, 0, 0);
            const heatmapDataUrl = canvas.toDataURL('image/png');

            // Detect suspicious zones (high difference areas)
            const suspiciousZones = detectSuspiciousZones(
              differences,
              canvas.width,
              canvas.height,
              maxDiff
            );

            // Calculate overall score
            const avgDiff = differences.reduce((a, b) => a + b, 0) / differences.length;
            const highDiffPixels = differences.filter(d => d > avgDiff * 2).length;
            const highDiffRatio = highDiffPixels / differences.length;

            let overallScore = 100;
            let details = '';

            if (highDiffRatio > 0.15) {
              overallScore = 30;
              details = `ALTA probabilità manipolazione: ${(highDiffRatio * 100).toFixed(1)}% pixel con differenze elevate. Zone con compressione inconsistente rilevate.`;
            } else if (highDiffRatio > 0.08) {
              overallScore = 60;
              details = `MEDIA probabilità manipolazione: ${(highDiffRatio * 100).toFixed(1)}% pixel con differenze moderate. Possibile editing localizzato.`;
            } else {
              overallScore = 85;
              details = `BASSA probabilità manipolazione: ${(highDiffRatio * 100).toFixed(1)}% pixel con differenze. Compressione uniforme, compatibile con immagine non editata.`;
            }

            details += ` Trovate ${suspiciousZones.length} zone sospette. Max diff: ${maxDiff.toFixed(2)}, Avg: ${avgDiff.toFixed(2)}.`;

            URL.revokeObjectURL(recompressedUrl);
            resolve({
              heatmapDataUrl,
              suspiciousZones,
              overallScore,
              details
            });
          };

          recompressedImg.onerror = () => {
            URL.revokeObjectURL(recompressedUrl);
            resolve(null);
          };

          recompressedImg.src = recompressedUrl;
        };

        img.onerror = () => resolve(null);
        img.src = e.target?.result as string;
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('ELA Analysis error:', error);
    return null;
  }
}

function detectSuspiciousZones(
  differences: number[],
  width: number,
  height: number,
  maxDiff: number
): Array<{ x: number; y: number; width: number; height: number; intensity: number }> {
  const threshold = maxDiff * 0.4;
  const zones: Array<{ x: number; y: number; width: number; height: number; intensity: number }> = [];
  const gridSize = 32;

  for (let gy = 0; gy < height; gy += gridSize) {
    for (let gx = 0; gx < width; gx += gridSize) {
      let sum = 0;
      let count = 0;

      for (let y = gy; y < Math.min(gy + gridSize, height); y++) {
        for (let x = gx; x < Math.min(gx + gridSize, width); x++) {
          sum += differences[y * width + x];
          count++;
        }
      }

      const avg = sum / count;
      if (avg > threshold) {
        zones.push({
          x: gx,
          y: gy,
          width: Math.min(gridSize, width - gx),
          height: Math.min(gridSize, height - gy),
          intensity: avg / maxDiff
        });
      }
    }
  }

  return zones.sort((a, b) => b.intensity - a.intensity).slice(0, 10);
}
