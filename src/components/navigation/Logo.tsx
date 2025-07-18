import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Logo.module.css';

/**
 * Neon & Retro logo for FlickyStream navigation bar.
 * Features flickering neon text effect for 'F' and 'S'.
 */
const Logo: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      title="FlickyStream"
      onClick={() => navigate('/')}
      className="cursor-pointer font-mono text-5xl font-bold"
    >
      <span className={styles.flickerF + ' text-white'}>F</span>
      <span className={styles.flickerS + ' text-white'} style={{ marginLeft: '-0.25em' }}>S</span>
    </div>
  );
}

export default Logo;
