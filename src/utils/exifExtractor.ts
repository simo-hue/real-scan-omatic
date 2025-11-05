import exifr from 'exifr';

export interface ExifData {
  camera?: string;
  software?: string;
  dateTime?: string;
  gps?: string;
  modified?: boolean;
  suspiciousEdits?: string[];
}

export async function extractExifData(file: File): Promise<ExifData | undefined> {
  try {
    // Parse EXIF data
    const exif = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      iptc: true,
      icc: false,
      jfif: false,
    });

    if (!exif) {
      console.log('No EXIF data found in image');
      return undefined;
    }

    console.log('EXIF data extracted:', exif);

    const result: ExifData = {};
    const suspiciousEdits: string[] = [];

    // Extract camera info
    if (exif.Make && exif.Model) {
      result.camera = `${exif.Make} ${exif.Model}`.trim();
    } else if (exif.Model) {
      result.camera = exif.Model;
    }

    // Extract software info
    if (exif.Software) {
      result.software = exif.Software;
      
      // Check for editing software
      const editingSoftware = [
        'photoshop', 'gimp', 'affinity', 'lightroom', 
        'paint.net', 'pixlr', 'canva', 'adobe', 
        'facetune', 'snapseed', 'vsco'
      ];
      
      const softwareLower = exif.Software.toLowerCase();
      if (editingSoftware.some(sw => softwareLower.includes(sw))) {
        suspiciousEdits.push(`Editing software rilevato: ${exif.Software}`);
      }
    }

    // Extract date/time
    if (exif.DateTimeOriginal) {
      result.dateTime = new Date(exif.DateTimeOriginal).toLocaleString('it-IT');
    } else if (exif.DateTime) {
      result.dateTime = new Date(exif.DateTime).toLocaleString('it-IT');
    }

    // Check for date discrepancies
    if (exif.DateTimeOriginal && exif.DateTime) {
      const original = new Date(exif.DateTimeOriginal).getTime();
      const modified = new Date(exif.DateTime).getTime();
      
      // If DateTime is significantly different from DateTimeOriginal, it was likely modified
      if (Math.abs(modified - original) > 60000) { // More than 1 minute difference
        suspiciousEdits.push('Data di modifica diversa dalla data di scatto originale');
      }
    }

    // Extract GPS
    if (exif.latitude && exif.longitude) {
      result.gps = `${exif.latitude.toFixed(6)}, ${exif.longitude.toFixed(6)}`;
    }

    // Check for missing EXIF (possible stripping)
    if (!exif.Make && !exif.Model && !exif.DateTimeOriginal) {
      suspiciousEdits.push('Metadati EXIF minimi o assenti - possibile rimozione intenzionale');
    }

    // Check for AI generation indicators
    if (exif.Software) {
      const aiIndicators = [
        'midjourney', 'stable diffusion', 'dall-e', 'dalle', 
        'ai', 'generated', 'synthetic', 'gan'
      ];
      const softwareLower = exif.Software.toLowerCase();
      if (aiIndicators.some(ai => softwareLower.includes(ai))) {
        suspiciousEdits.push(`Possibile AI generation: ${exif.Software}`);
      }
    }

    // Check XMP data for additional editing info
    if (exif.HistoryAction || exif.HistoryChanged) {
      suspiciousEdits.push('Cronologia modifiche rilevata nei metadati XMP');
    }

    // Mark as modified if we found suspicious edits
    if (suspiciousEdits.length > 0) {
      result.modified = true;
      result.suspiciousEdits = suspiciousEdits;
    }

    return result;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return undefined;
  }
}