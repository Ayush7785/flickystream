import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Image logo for FlickyStream navigation bar.
 * Clicking the logo navigates to the homepage.
 */
const Logo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <img
      src="https://api.flickystream.co/flogo.png"
      alt="FlickyStream Logo"
      title="FlickyStream"
      onClick={() => navigate('/')}
      className="cursor-pointer h-12 w-auto"
    />
  );
};

export default Logo;
