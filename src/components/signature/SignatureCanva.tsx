'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';

export interface SignatureCanvasRef {
  clear: () => void;
  isEmpty: () => boolean;
  getTrimmedCanvas: () => HTMLCanvasElement;
  getCanvas: () => HTMLCanvasElement;
  toDataURL: (type?: string, quality?: number) => string;
  loadFromDataURL: (dataURL: string) => void;
}

interface SignatureCanvasProps {
  penColor?: string;
  backgroundColor?: string;
  canvasProps?: {
    width: number;
    height: number;
    className?: string;
  };
  onBegin?: () => void;
  onEnd?: () => void;
}

const CustomSignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  ({ 
    penColor = '#000000', 
    backgroundColor = 'transparent',
    canvasProps,
    onBegin,
    onEnd
  }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const hasDrawn = useRef(false);
    const lastPoint = useRef({ x: 0, y: 0 });
    const touchIdentifier = useRef<number | null>(null);

    // Initialize canvas
    const initializeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas styling
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = penColor;

      // Set background if specified
      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Ensure crisp lines on high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }, [penColor, backgroundColor]);

    // Get coordinates from mouse/touch event
    const getCoordinates = useCallback((e: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        // Handle touch events
        const touch = e.changedTouches[0] || e.touches[0];
        if (!touch) return { x: 0, y: 0 };
        
        clientX = touch.clientX;
        clientY = touch.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }, []);

    // Start drawing
    const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      
      // For touch events, store the touch identifier
      if (e instanceof TouchEvent) {
        const touch = e.changedTouches[0];
        if (touch) {
          touchIdentifier.current = touch.identifier;
        }
      }

      isDrawing.current = true;
      const { x, y } = getCoordinates(e);
      lastPoint.current = { x, y };
      
      onBegin?.();
    }, [getCoordinates, onBegin]);

    // Draw line
    const draw = useCallback((e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      
      e.preventDefault();

      // For touch events, make sure we're tracking the right touch
      if (e instanceof TouchEvent) {
        const touch = Array.from(e.changedTouches).find(
          t => t.identifier === touchIdentifier.current
        );
        if (!touch) return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);

      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastPoint.current = { x, y };
      hasDrawn.current = true;
    }, [getCoordinates]);

    // Stop drawing
    const stopDrawing = useCallback(() => {
      if (isDrawing.current) {
        isDrawing.current = false;
        touchIdentifier.current = null;
        onEnd?.();
      }
    }, [onEnd]);

    // Prevent scrolling when drawing
    const preventScroll = useCallback((e: TouchEvent) => {
      if (isDrawing.current) {
        e.preventDefault();
      }
    }, []);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Reset background if specified
        if (backgroundColor && backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        hasDrawn.current = false;
      },

      isEmpty: () => {
        return !hasDrawn.current;
      },

      getTrimmedCanvas: () => {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas not available');

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        // If nothing was drawn, return a minimal canvas
        if (!hasDrawn.current) {
          const emptyCanvas = document.createElement('canvas');
          emptyCanvas.width = 1;
          emptyCanvas.height = 1;
          return emptyCanvas;
        }

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;

        // Find bounds of non-transparent pixels
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const alpha = data[(y * canvas.width + x) * 4 + 3];
            if (alpha > 0) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        // If no drawing found, return minimal canvas
        if (minX > maxX || minY > maxY) {
          const emptyCanvas = document.createElement('canvas');
          emptyCanvas.width = 1;
          emptyCanvas.height = 1;
          return emptyCanvas;
        }

        // Add padding
        const padding = 10;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width, maxX + padding);
        maxY = Math.min(canvas.height, maxY + padding);

        // Create trimmed canvas
        const trimmedCanvas = document.createElement('canvas');
        trimmedCanvas.width = maxX - minX;
        trimmedCanvas.height = maxY - minY;

        const trimmedCtx = trimmedCanvas.getContext('2d');
        if (!trimmedCtx) throw new Error('Could not create trimmed canvas context');

        // Set background for trimmed canvas if specified
        if (backgroundColor && backgroundColor !== 'transparent') {
          trimmedCtx.fillStyle = backgroundColor;
          trimmedCtx.fillRect(0, 0, trimmedCanvas.width, trimmedCanvas.height);
        }

        // Draw the trimmed portion
        trimmedCtx.drawImage(
          canvas,
          minX, minY, maxX - minX, maxY - minY,
          0, 0, maxX - minX, maxY - minY
        );

        return trimmedCanvas;
      },

      getCanvas: () => {
        if (!canvasRef.current) throw new Error('Canvas not available');
        return canvasRef.current;
      },

      toDataURL: (type = 'image/png', quality = 1) => {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas not available');
        return canvas.toDataURL(type, quality);
      },

      loadFromDataURL: (dataURL: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Set background if specified
          if (backgroundColor && backgroundColor !== 'transparent') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          // Draw the loaded image
          ctx.drawImage(img, 0, 0);
          hasDrawn.current = true;
        };
        img.onerror = () => {
          console.error('Failed to load image from data URL');
        };
        img.src = dataURL;
      }
    }), [backgroundColor]);

    // Set up event listeners
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Initialize canvas
      initializeCanvas();

      // Mouse events
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseout', stopDrawing);

      // Touch events
      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);
      canvas.addEventListener('touchcancel', stopDrawing);

      // Prevent scrolling when drawing
      canvas.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
        canvas.removeEventListener('touchcancel', stopDrawing);
        canvas.removeEventListener('touchmove', preventScroll);
      };
    }, [initializeCanvas, startDrawing, draw, stopDrawing, preventScroll]);

    // Re-initialize when props change
    useEffect(() => {
      initializeCanvas();
    }, [penColor, backgroundColor, canvasProps?.width, canvasProps?.height]);

    return (
      <canvas
        ref={canvasRef}
        width={canvasProps?.width || 400}
        height={canvasProps?.height || 200}
        className={canvasProps?.className || ''}
        style={{
          cursor: 'crosshair',
          touchAction: 'none',
          userSelect: 'none',
          display: 'block'
        }}
      />
    );
  }
);

CustomSignatureCanvas.displayName = 'CustomSignatureCanvas';

export default CustomSignatureCanvas;