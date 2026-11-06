"use client";

import { useEffect, useRef } from "react";

const LINK_DISTANCE = 140;
const POINTER_RADIUS = 200;
const PULSE_INTERVAL = 1200;
const MAX_NODES = 130;

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  major: boolean;
};

type Pulse = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
};

type Palette = {
  brand: string;
  teal: string;
  blue: string;
  white: string;
  line: string;
  pointer: string;
  inner: string;
  outer: string;
};

function readColor(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function readPalette(): Palette {
  return {
    brand: readColor("--constellation-node-brand", "#0033AD"),
    teal: readColor("--constellation-node-teal", "#3CC8C8"),
    blue: readColor("--constellation-node-blue", "#5B8CFF"),
    white: readColor("--constellation-node-white", "#ffffff"),
    line: readColor("--constellation-line", "#3CC8C8"),
    pointer: readColor("--constellation-pointer", "#ffffff"),
    inner: readColor("--constellation-bg-inner", "#0a1a4a"),
    outer: readColor("--constellation-bg-outer", "#050b1f"),
  };
}

function withAlpha(color: string, alpha: number) {
  const amount = Math.max(0, Math.min(1, alpha));
  const hex = color.replace("#", "").trim();
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((channel) => channel + channel)
          .join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return color;
  }
  const red = Number.parseInt(full.slice(0, 2), 16);
  const green = Number.parseInt(full.slice(2, 4), 16);
  const blue = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${amount})`;
}

export function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    const board = canvas;
    const pen = context;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let pulses: Pulse[] = [];
    let frame = 0;
    let running = false;
    let lastPulse = 0;
    let lastTime = 0;
    let colors = readPalette();
    let background: CanvasGradient | null = null;
    const pointer = { x: -10_000, y: -10_000, active: false };

    function createStars() {
      const count = Math.min(MAX_NODES, Math.floor((width * height) / 11_000));
      const choices = [colors.brand, colors.teal, colors.blue, colors.white];
      stars = Array.from({ length: Math.max(0, count) }, () => {
        const major = Math.random() < 0.08;
        const choice = choices[Math.floor(Math.random() * choices.length)] ?? colors.white;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          radius: major ? 3 + Math.random() : 1 + Math.random() * 2,
          color: choice,
          major,
        };
      });
      pulses = [];
    }

    function paintBackground() {
      if (!background) {
        return;
      }
      pen.fillStyle = background;
      pen.fillRect(0, 0, width, height);
    }

    function drawLinks() {
      pen.lineWidth = 1;
      const cell = LINK_DISTANCE;
      const buckets = new Map<string, number[]>();
      for (let index = 0; index < stars.length; index += 1) {
        const star = stars[index];
        if (!star) {
          continue;
        }
        const key = `${Math.floor(star.x / cell)}:${Math.floor(star.y / cell)}`;
        const bucket = buckets.get(key);
        if (bucket) {
          bucket.push(index);
        } else {
          buckets.set(key, [index]);
        }
      }

      for (let index = 0; index < stars.length; index += 1) {
        const from = stars[index];
        if (!from) {
          continue;
        }
        const column = Math.floor(from.x / cell);
        const row = Math.floor(from.y / cell);
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
            const neighbors = buckets.get(`${column + offsetX}:${row + offsetY}`);
            if (!neighbors) {
              continue;
            }
            for (const other of neighbors) {
              if (other <= index) {
                continue;
              }
              const to = stars[other];
              if (!to) {
                continue;
              }
              const distance = Math.hypot(from.x - to.x, from.y - to.y);
              if (distance >= LINK_DISTANCE) {
                continue;
              }
              pen.strokeStyle = withAlpha(colors.line, (1 - distance / LINK_DISTANCE) * 0.4);
              pen.beginPath();
              pen.moveTo(from.x, from.y);
              pen.lineTo(to.x, to.y);
              pen.stroke();
            }
          }
        }
      }
    }

    function drawPointer() {
      if (!pointer.active || reduced) {
        return;
      }
      pen.lineWidth = 0.6;
      for (const star of stars) {
        const dx = pointer.x - star.x;
        const dy = pointer.y - star.y;
        const distance = Math.hypot(dx, dy);
        if (distance === 0 || distance >= POINTER_RADIUS) {
          continue;
        }
        const pull = ((POINTER_RADIUS - distance) / POINTER_RADIUS) * 0.45;
        star.x += (dx / distance) * pull;
        star.y += (dy / distance) * pull;
        pen.strokeStyle = withAlpha(colors.pointer, (1 - distance / POINTER_RADIUS) * 0.45);
        pen.beginPath();
        pen.moveTo(pointer.x, pointer.y);
        pen.lineTo(star.x, star.y);
        pen.stroke();
      }
    }

    function drawPulses() {
      pen.lineWidth = 1;
      for (const pulse of pulses) {
        pen.strokeStyle = withAlpha(colors.teal, pulse.alpha);
        pen.beginPath();
        pen.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        pen.stroke();
      }
    }

    function drawStars() {
      for (const star of stars) {
        pen.beginPath();
        pen.fillStyle = star.color;
        pen.shadowColor = star.color;
        pen.shadowBlur = star.major ? 14 : 6;
        pen.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        pen.fill();
      }
      pen.shadowBlur = 0;
    }

    function step(dt: number) {
      for (const star of stars) {
        star.x += star.vx * dt;
        star.y += star.vy * dt;
        if (star.x <= star.radius) {
          star.x = star.radius;
          star.vx = Math.abs(star.vx) * 0.86;
        } else if (star.x >= width - star.radius) {
          star.x = width - star.radius;
          star.vx = -Math.abs(star.vx) * 0.86;
        }
        if (star.y <= star.radius) {
          star.y = star.radius;
          star.vy = Math.abs(star.vy) * 0.86;
        } else if (star.y >= height - star.radius) {
          star.y = height - star.radius;
          star.vy = -Math.abs(star.vy) * 0.86;
        }
      }
    }

    function render(dt: number, frozen: boolean) {
      paintBackground();
      if (!frozen) {
        step(dt);
      }
      drawLinks();
      drawPointer();
      drawPulses();
      drawStars();
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(frame);
    }

    function tick(time: number) {
      if (!running) {
        return;
      }
      const dt = lastTime === 0 ? 1 : Math.min(2, (time - lastTime) / 16.67);
      lastTime = time;
      if (time - lastPulse >= PULSE_INTERVAL && stars.length > 0) {
        const origin = stars[Math.floor(Math.random() * stars.length)];
        if (origin) {
          pulses.push({ x: origin.x, y: origin.y, radius: origin.radius, alpha: 0.55 });
        }
        lastPulse = time;
      }
      for (const pulse of pulses) {
        pulse.radius += 1.2 * dt;
        pulse.alpha -= 0.014 * dt;
      }
      pulses = pulses.filter((pulse) => pulse.alpha > 0 && pulse.radius < 110);
      render(dt, false);
      frame = window.requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduced) {
        return;
      }
      running = true;
      lastTime = 0;
      lastPulse = 0;
      frame = window.requestAnimationFrame(tick);
    }

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      board.width = Math.floor(width * ratio);
      board.height = Math.floor(height * ratio);
      board.style.width = `${width}px`;
      board.style.height = `${height}px`;
      pen.setTransform(ratio, 0, 0, ratio, 0, 0);
      colors = readPalette();
      background = pen.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.72,
      );
      background.addColorStop(0, colors.inner);
      background.addColorStop(1, colors.outer);
      createStars();
      render(0, true);
    }

    function onResize() {
      resize();
    }

    function onMove(event: MouseEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }

    function onLeave(event: MouseEvent) {
      if (event.relatedTarget === null) {
        pointer.active = false;
      }
    }

    function onTouch(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      pointer.x = touch.clientX;
      pointer.y = touch.clientY;
      pointer.active = true;
    }

    function onTouchEnd() {
      pointer.active = false;
    }

    function onMotionChange() {
      reduced = motionQuery.matches;
      if (reduced) {
        stop();
        pulses = [];
        pointer.active = false;
        render(0, true);
        return;
      }
      start();
    }

    resize();
    if (reduced) {
      render(0, true);
    } else {
      start();
    }

    function onVisibility() {
      if (document.hidden) {
        stop();
        return;
      }
      if (!reduced) {
        start();
      }
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1 }}
    />
  );
}
