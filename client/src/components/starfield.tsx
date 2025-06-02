import { useEffect, useRef } from "react";

export default function Starfield() {
  const starfieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const starfield = starfieldRef.current;
    if (!starfield) return;

    const numStars = 150;

    // Clear existing stars
    starfield.innerHTML = '';

    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'absolute w-1 h-1 rounded-full animate-twinkle';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      star.style.opacity = (Math.random() * 0.8 + 0.2).toString();
      
      // Random colorful stars
      const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4dabf7', '#9775fa', '#ff922b'];
      star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      star.style.boxShadow = `0 0 6px ${star.style.backgroundColor}`;
      
      starfield.appendChild(star);
    }
  }, []);

  return <div ref={starfieldRef} className="fixed inset-0 z-0" />;
}
