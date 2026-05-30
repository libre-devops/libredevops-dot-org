'use client';

import { useEffect, useRef, useState } from 'react';

const words = ['DevOps', 'Platform', 'Security', 'Software', 'AI'];

type Phase = 'typing' | 'hold' | 'deleting';

export function RotatingTitle() {
    const ref = useRef<HTMLHeadingElement>(null);
    // SSR + first paint show the first word fully typed; the typewriter only
    // takes over after mount (and only when motion is allowed).
    const [wordIdx, setWordIdx] = useState(0);
    const [typed, setTyped] = useState(words[0]);
    const [phase, setPhase] = useState<Phase>('hold');
    const [animate, setAnimate] = useState(false);
    const [visible, setVisible] = useState(true);
    const [caretOn, setCaretOn] = useState(true);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        setTyped('');
        setPhase('typing');
        setAnimate(true);
    }, []);

    // Pause while the title is scrolled out of view.
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const running = animate && visible;

    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => setCaretOn((v) => !v), 530);
        return () => clearInterval(t);
    }, [running]);

    useEffect(() => {
        if (!running) return;
        const word = words[wordIdx];

        if (phase === 'typing') {
            if (typed.length < word.length) {
                const t = setTimeout(
                    () => setTyped(word.slice(0, typed.length + 1)),
                    85 + Math.random() * 45,
                );
                return () => clearTimeout(t);
            }
            const t = setTimeout(() => setPhase('hold'), 1700);
            return () => clearTimeout(t);
        }

        if (phase === 'hold') {
            const t = setTimeout(() => setPhase('deleting'), 450);
            return () => clearTimeout(t);
        }

        // deleting
        if (typed.length > 0) {
            const t = setTimeout(() => setTyped(word.slice(0, typed.length - 1)), 45);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => {
            setWordIdx((i) => (i + 1) % words.length);
            setPhase('typing');
        }, 220);
        return () => clearTimeout(t);
    }, [running, phase, typed, wordIdx]);

    return (
        <h1 className="hero-title" ref={ref}>
            <span className="hero-title-rotator">
                {typed}
                {animate && (
                    <span
                        className="hero-title-caret"
                        style={{ opacity: caretOn ? 1 : 0 }}
                    />
                )}
            </span><br />
            Engineering,<br />done in the open.
        </h1>
    );
}
