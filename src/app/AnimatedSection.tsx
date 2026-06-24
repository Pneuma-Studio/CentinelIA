'use client';

import { motion, useInView } from 'motion/react';
import { useRef, type CSSProperties, type ReactNode } from 'react';

interface Props {
  children:   ReactNode;
  className?: string;
  style?:     CSSProperties;
  delay?:     number;
  y?:         number;
}

export default function AnimatedSection({ children, className, style, delay = 0, y = 32 }: Props) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
