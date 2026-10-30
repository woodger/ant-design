// Ant Design 6.6.8; MIT, vendor/LICENSE.ant-design.
const MEASURE_SIZE = 200;

export function previewImage(file: File | Blob): Promise<string> {
  return new Promise<string>((resolve) => {
    if (!file.type || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }

    if (file.type.startsWith('image/gif')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = MEASURE_SIZE;
    canvas.height = MEASURE_SIZE;
    canvas
      .style
      .cssText = `position: fixed; left: 0; top: 0; width: ${MEASURE_SIZE}px; height: ${MEASURE_SIZE}px; z-index: 9999; display: none;`;
    document.body.appendChild<HTMLCanvasElement>(canvas);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;

      let drawWidth = MEASURE_SIZE;
      let drawHeight = MEASURE_SIZE;
      let offsetX = 0;
      let offsetY = 0;

      if (width > height) {
        drawHeight = height * (MEASURE_SIZE / width);
        offsetY = -(drawHeight - drawWidth) / 2;
      } else {
        drawWidth = width * (MEASURE_SIZE / height);
        offsetX = -(drawWidth - drawHeight) / 2;
      }

      ctx!.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      const dataURL = canvas.toDataURL();
      document.body.removeChild(canvas);
      window.URL.revokeObjectURL(img.src);
      resolve(dataURL);
    };
    img.crossOrigin = 'anonymous';
    img.onerror = () => {
      document.body.removeChild(canvas);
      window.URL.revokeObjectURL(img.src);
      resolve('');
    };
    if (file.type.startsWith('image/svg+xml')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    } else {
      img.src = window.URL.createObjectURL(file);
    }
  });
}
