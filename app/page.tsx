"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const articleRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLCanvasElement | null>(null);

  // smooth auto-scroll whenever article changes
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [article]);

  // word-by-word typewriter with smooth scroll
  const typeWriter = async (text: string, speed = 50) => {
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      setArticle((prev) => prev + (i === 0 ? words[i] : " " + words[i]));
      const el = articleRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      await new Promise((r) => setTimeout(r, speed));
    }
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setArticle("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              await typeWriter(parsed.response, 18);
            }
          } catch (e) {
            console.error("JSON parse error:", e, line);
          }
        }
      }
    } catch (err) {
      console.error("Generation error:", err);
      setArticle((prev) => prev + "\n\n[Error generating article]");
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const wordCount = article ? article.split(" ").length : 0;
  const readTime = Math.ceil(wordCount / 200);

  // Particle animation
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-6
      bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600
      animate-gradient-x bg-[length:400%_400%] overflow-hidden"
    >
      {/* Particle canvas */}
      <canvas ref={particlesRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

      <div
        className="relative z-10 max-w-2xl w-full
        backdrop-blur-xl bg-white/20 border-white/30
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        rounded-3xl p-8 space-y-6 text-white"
      >
        <h1 className="text-4xl font-extrabold text-center drop-shadow-md">
          ✨ AI Article Generator
        </h1>

        {/* Prompt input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-4 rounded-2xl border border-white/40 bg-white/10 text-white placeholder-white/60
            focus:outline-none focus:ring-4 focus:ring-purple-400/50"
          placeholder="Enter your topic..."
          rows={4}
        />

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-3 rounded-2xl font-semibold
            bg-gradient-to-r from-pink-500 to-purple-600
            hover:from-pink-600 hover:to-purple-700
            transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? "⚡ Generating..." : "🚀 Generate Article"}
        </button>

        {/* Article display */}
        <div
          ref={articleRef}
          className="p-4 rounded-2xl border border-white/30 bg-black/30 h-64 max-h-[60vh] overflow-y-auto whitespace-pre-wrap relative"
        >
          {article || "Your generated article will appear here..."}
          {isTyping && (
            <span className="ml-1 inline-block w-1 bg-gradient-to-r from-pink-400 to-purple-400 animate-blink"></span>
          )}
        </div>

        {/* Word count & actions */}
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-white/70">
            {wordCount} words (~{readTime} min read)
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(article)}
              className="px-3 py-1 bg-purple-500 rounded-xl hover:bg-purple-600 transition text-white text-sm"
            >
              📋 Copy
            </button>
            <button
              onClick={() => {
                const blob = new Blob([article], { type: "text/plain" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "article.txt";
                link.click();
              }}
              className="px-3 py-1 bg-pink-500 rounded-xl hover:bg-pink-600 transition text-white text-sm"
            >
              💾 Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
