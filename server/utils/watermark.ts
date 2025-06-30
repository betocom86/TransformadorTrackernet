import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  color?: string;
  backgroundColor?: string;
  padding?: number;
}

export async function addWatermarkToImage(
  inputPath: string,
  outputPath: string,
  options: WatermarkOptions
): Promise<void> {
  const {
    text,
    fontSize = 20,
    position = 'bottom-right',
    padding = 10
  } = options;

  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Could not determine image dimensions');
    }

    // Create simple text watermark using Sharp's text overlay
    const lines = text.split('\n');
    const lineHeight = fontSize + 4;
    const maxLineWidth = Math.max(...lines.map(line => line.length * (fontSize * 0.6)));
    
    const watermarkWidth = maxLineWidth + (padding * 2);
    const watermarkHeight = (lines.length * lineHeight) + (padding * 2);
    
    // Create SVG text watermark
    const svgWatermark = `
      <svg width="${watermarkWidth}" height="${watermarkHeight}">
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" rx="5"/>
        ${lines.map((line, index) => `
          <text x="${padding}" y="${padding + (index + 1) * lineHeight}" 
                font-family="Arial" font-size="${fontSize}" 
                fill="white" font-weight="bold">${line}</text>
        `).join('')}
      </svg>
    `;
    
    // Calculate position
    let left = 0;
    let top = 0;
    
    switch (position) {
      case 'bottom-right':
        left = metadata.width - watermarkWidth - 20;
        top = metadata.height - watermarkHeight - 20;
        break;
      case 'bottom-left':
        left = 20;
        top = metadata.height - watermarkHeight - 20;
        break;
      case 'top-right':
        left = metadata.width - watermarkWidth - 20;
        top = 20;
        break;
      case 'top-left':
        left = 20;
        top = 20;
        break;
      case 'center':
        left = Math.floor((metadata.width - watermarkWidth) / 2);
        top = Math.floor((metadata.height - watermarkHeight) / 2);
        break;
    }
    
    // Apply watermark to image
    await sharp(inputPath)
      .composite([{
        input: Buffer.from(svgWatermark),
        left: Math.max(0, left),
        top: Math.max(0, top),
        blend: 'over'
      }])
      .jpeg({ quality: 90 })
      .toFile(outputPath);
      
  } catch (error) {
    console.error('Error adding watermark:', error);
    throw error;
  }
}

export async function createWorkOrderWatermark(
  workOrderNumber: string,
  personnelName: string,
  timestamp: Date = new Date()
): Promise<string> {
  const dateStr = timestamp.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `GC Electric - OT: ${workOrderNumber}\n${personnelName} - ${dateStr}`;
}

export async function processWorkOrderPhoto(
  inputPath: string,
  workOrderNumber: string,
  personnelName: string,
  photoType: string
): Promise<{ watermarkedPath: string; originalPath: string }> {
  const timestamp = new Date();
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const dir = path.dirname(inputPath);
  
  // Create paths for original and watermarked versions
  const originalPath = path.join(dir, `${baseName}_original${ext}`);
  const watermarkedPath = path.join(dir, `${baseName}_watermarked${ext}`);
  
  // Copy original file
  await fs.copyFile(inputPath, originalPath);
  
  // Create watermark text
  const watermarkText = await createWorkOrderWatermark(workOrderNumber, personnelName, timestamp);
  
  // Add watermark
  await addWatermarkToImage(inputPath, watermarkedPath, {
    text: watermarkText,
    fontSize: 16,
    opacity: 0.8,
    position: 'bottom-right',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8
  });
  
  return { watermarkedPath, originalPath };
}