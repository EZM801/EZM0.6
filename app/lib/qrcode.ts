import QRCode from 'qrcode';

export async function generateQRCode(data: string, options: QRCode.QRCodeToDataURLOptions = {}): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      ...options,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function generateQRCodeBuffer(data: string, options: QRCode.QRCodeToBufferOptions = {}): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      ...options,
    });
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
} 