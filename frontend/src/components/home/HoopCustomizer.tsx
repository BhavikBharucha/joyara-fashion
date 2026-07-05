import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const FABRIC_OPTIONS = [
  { id: 'natural', label: 'Natural', desc: 'Natural Ivory Linen', bg: '#F5EDE3', textColor: '#4A3728' },
  { id: 'midnight', label: 'Midnight', desc: 'Deep Midnight Cotton', bg: '#1C1E2E', textColor: '#D4C5A9' },
  { id: 'sage', label: 'Sage', desc: 'Soft Sage Linen', bg: '#C5CEB5', textColor: '#3A4A2E' },
];

const MOTIF_OPTIONS = [
  { id: 'spring-buds', label: 'Spring Buds', pattern: 'buds' },
  { id: 'laurel-vine', label: 'Laurel Vine', pattern: 'vine' },
  { id: 'luxe-constellation', label: 'Luxe Constellation', pattern: 'constellation' },
];

const THREAD_COLORS = [
  { id: 'burgundy', label: 'Burgundy', hex: '#7B2D3B' },
  { id: 'dusty-rose', label: 'Dusty Rose', hex: '#C4878E' },
  { id: 'gold', label: 'Gold', hex: '#C5A55A' },
  { id: 'navy', label: 'Navy', hex: '#2C3E6B' },
  { id: 'forest', label: 'Forest', hex: '#3A5A40' },
  { id: 'charcoal', label: 'Charcoal', hex: '#3D3D3D' },
];

const BASE_PRICE = 2490;

function drawHoop(
  canvas: HTMLCanvasElement,
  text: string,
  fabric: typeof FABRIC_OPTIONS[0],
  motif: typeof MOTIF_OPTIONS[0],
  threadColor: string,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.min(w, h) * 0.42;
  const innerR = outerR - 12;

  ctx.clearRect(0, 0, w, h);

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = '#C8A882';
  ctx.fill();
  ctx.restore();

  // Outer wooden ring
  const ringGrad = ctx.createRadialGradient(cx - outerR * 0.2, cy - outerR * 0.2, outerR * 0.5, cx, cy, outerR);
  ringGrad.addColorStop(0, '#D4B896');
  ringGrad.addColorStop(0.5, '#C8A882');
  ringGrad.addColorStop(1, '#B8956E');
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  // Inner fabric circle
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = fabric.bg;
  ctx.fill();

  // Motif decorations
  drawMotif(ctx, cx, cy, innerR, motif, threadColor);

  // Text
  const displayText = text || 'YOUR TEXT';
  const fontSize = Math.max(14, Math.min(36, innerR * 0.3 * (6 / Math.max(displayText.length, 3))));
  ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
  ctx.fillStyle = fabric.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '4px';
  ctx.fillText(displayText.toUpperCase(), cx, cy - 8);

  // Subtitle
  ctx.font = `300 ${Math.max(8, fontSize * 0.35)}px 'Inter', sans-serif`;
  ctx.fillStyle = fabric.textColor;
  ctx.letterSpacing = '3px';

  // Divider line
  const divW = Math.min(50, innerR * 0.3);
  ctx.beginPath();
  ctx.moveTo(cx - divW / 2, cy + fontSize * 0.35);
  ctx.lineTo(cx + divW / 2, cy + fontSize * 0.35);
  ctx.strokeStyle = fabric.textColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillText('HAND-STITCHED', cx, cy + fontSize * 0.35 + 16);

  // Top clasp
  const claspW = 28;
  const claspH = 12;
  const claspY = cy - outerR - 2;
  ctx.fillStyle = '#A8926E';
  ctx.beginPath();
  ctx.roundRect(cx - claspW / 2, claspY, claspW, claspH, 3);
  ctx.fill();
  ctx.fillStyle = '#8A7A60';
  ctx.beginPath();
  ctx.roundRect(cx - 6, claspY + 3, 12, 6, 2);
  ctx.fill();
}

function drawMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  motif: typeof MOTIF_OPTIONS[0],
  color: string,
) {
  const motifR = r * 0.7;

  if (motif.pattern === 'buds') {
    // Dashed circle
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, motifR, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Flower buds around the circle
    const budCount = 8;
    for (let i = 0; i < budCount; i++) {
      const angle = (i / budCount) * Math.PI * 2 - Math.PI / 2;
      const bx = cx + Math.cos(angle) * motifR;
      const by = cy + Math.sin(angle) * motifR;

      // Bud (small filled circle with petal)
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Small leaf
      const leafAngle = angle + Math.PI / 2;
      ctx.beginPath();
      ctx.ellipse(
        bx + Math.cos(leafAngle) * 6,
        by + Math.sin(leafAngle) * 6,
        3, 6, leafAngle, 0, Math.PI * 2
      );
      ctx.fillStyle = color + '60';
      ctx.fill();
    }
  } else if (motif.pattern === 'vine') {
    // Continuous vine circle
    ctx.beginPath();
    ctx.arc(cx, cy, motifR, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Leaf pairs along the vine
    const leafCount = 12;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2;
      const lx = cx + Math.cos(angle) * motifR;
      const ly = cy + Math.sin(angle) * motifR;

      // Inner leaf
      ctx.beginPath();
      ctx.ellipse(
        lx - Math.cos(angle) * 8,
        ly - Math.sin(angle) * 8,
        3, 7, angle + 0.5, 0, Math.PI * 2
      );
      ctx.fillStyle = color + '50';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Outer leaf
      ctx.beginPath();
      ctx.ellipse(
        lx + Math.cos(angle) * 8,
        ly + Math.sin(angle) * 8,
        3, 7, angle - 0.5, 0, Math.PI * 2
      );
      ctx.fillStyle = color + '30';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  } else {
    // Constellation: dots connected by thin lines
    const starCount = 10;
    const stars: { x: number; y: number }[] = [];

    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2 + (i % 2 === 0 ? 0.15 : -0.15);
      const dist = motifR * (0.7 + (i % 3) * 0.15);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      stars.push({ x: sx, y: sy });
    }

    // Connect stars
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dist = Math.hypot(stars[j].x - stars[i].x, stars[j].y - stars[i].y);
        if (dist < motifR * 0.8) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw stars
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color + '15';
      ctx.fill();
    }
  }
}

export default function HoopCustomizer() {
  const [text, setText] = useState('JOYARA');
  const [fabricIdx, setFabricIdx] = useState(0);
  const [motifIdx, setMotifIdx] = useState(0);
  const [threadIdx, setThreadIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fabric = FABRIC_OPTIONS[fabricIdx];
  const motif = MOTIF_OPTIONS[motifIdx];
  const thread = THREAD_COLORS[threadIdx];

  const redraw = useCallback(() => {
    if (canvasRef.current) {
      drawHoop(canvasRef.current, text, fabric, motif, thread.hex);
    }
  }, [text, fabric, motif, thread]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const container = canvasRef.current.parentElement;
      if (!container) return;
      const size = Math.min(container.clientWidth, 500);
      canvasRef.current.width = size;
      canvasRef.current.height = size;
      redraw();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-secondary-400 mb-3">/ Creative Archive</p>
          <h2 className="font-heading text-3xl md:text-5xl text-secondary-900 mb-4">Bespoke Hoop Customizer</h2>
          <div className="w-10 h-0.5 bg-secondary-900 mx-auto mb-4" />
          <p className="text-sm text-secondary-500 max-w-lg mx-auto leading-relaxed">
            Create a timeless keepsake. Personalize our classic hand-stitched embroidery hoop
            with your text, fabric base, and custom silk skein colors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Controls */}
          <div className="space-y-8 order-2 lg:order-1">
            {/* 1. Text */}
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-secondary-900 font-medium mb-3">
                1. Text / Monogram <span className="text-secondary-400">(Max 10 chars)</span>
              </h3>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 10))}
                maxLength={10}
                className="w-full px-4 py-3 border border-secondary-200 text-sm tracking-wider uppercase focus:outline-none focus:border-secondary-900 transition-colors"
                placeholder="Enter your text"
              />
            </div>

            {/* 2. Fabric */}
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-secondary-900 font-medium mb-3">
                2. Fabric Base Material
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {FABRIC_OPTIONS.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setFabricIdx(i)}
                    className={`py-3 text-xs tracking-[0.15em] uppercase font-medium transition-all border ${
                      fabricIdx === i
                        ? 'bg-secondary-900 text-white border-secondary-900'
                        : 'bg-white text-secondary-700 border-secondary-200 hover:border-secondary-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] italic text-secondary-400 mt-2 tracking-wide uppercase">
                Base: {fabric.desc}
              </p>
            </div>

            {/* 3. Motif */}
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-secondary-900 font-medium mb-3">
                3. Embroidered Motif Frame
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {MOTIF_OPTIONS.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setMotifIdx(i)}
                    className={`py-3 text-xs tracking-[0.15em] uppercase font-medium transition-all border ${
                      motifIdx === i
                        ? 'bg-secondary-900 text-white border-secondary-900'
                        : 'bg-white text-secondary-700 border-secondary-200 hover:border-secondary-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Thread Color */}
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase text-secondary-900 font-medium mb-3">
                4. Silk Thread Color
              </h3>
              <div className="flex flex-wrap gap-3">
                {THREAD_COLORS.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setThreadIdx(i)}
                    className={`group flex items-center gap-2 px-4 py-2.5 border transition-all ${
                      threadIdx === i
                        ? 'border-secondary-900 bg-secondary-50'
                        : 'border-secondary-200 hover:border-secondary-400'
                    }`}
                    title={c.label}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-secondary-200"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs tracking-wider uppercase">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price & CTA */}
            <div className="border-t border-secondary-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs tracking-[0.2em] uppercase text-secondary-400">Price Composition:</span>
                <span className="font-heading text-2xl text-secondary-900">
                  &#8377;{BASE_PRICE.toLocaleString('en-IN')}
                </span>
              </div>
              <button className="w-full py-4 bg-secondary-900 text-white text-xs tracking-[0.2em] uppercase font-medium hover:bg-secondary-800 transition-colors">
                Add Custom Hoop to Couture Bag
              </button>
            </div>
          </div>

          {/* Canvas Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 flex items-center justify-center bg-secondary-50/50 rounded-lg p-8 lg:sticky lg:top-24"
          >
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="max-w-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
