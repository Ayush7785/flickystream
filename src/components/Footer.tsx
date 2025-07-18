import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-black border-t border-white/10 py-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-white/50 text-xs">
          © {currentYear} FlickyStream. All rights reserved.
        </p>
        <p className="text-white/50 text-xs mt-1">
          This site does not store any files on its server. All contents are provided by non-affiliated third parties.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
