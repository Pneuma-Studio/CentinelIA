'use client';

import { motion, useInView } from 'motion/react';
import { useRef, type CSSProperties, type ReactNode } from 'react';

export default function MeerkatReveal({ children, className, style }: {
  children:   ReactNode;
  className?: string;
  style?:     CSSProperties;
}) {
  const ref    = useRef(null);
  // Only fires when element is 25% inside from viewport bottom, cards appear first
  const inView = useInView(ref, { once: true, margin: '0px 0px -25% 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
