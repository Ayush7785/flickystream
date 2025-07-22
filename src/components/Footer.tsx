import React, { useEffect, useState, useRef } from 'react';

const FloatingMobileFooter: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { icon: 'fas fa-home', label: 'Home', path: '/' },
    { icon: 'fas fa-film', label: 'Movies', path: '/movie' },
    { icon: 'fas fa-fire', label: 'Trending', path: '/trending' },
    { icon: 'fas fa-tv', label: 'Series', path: '/tv' },
    {
      icon: 'fas fa-ellipsis-h',
      label: 'More',
      dropdown: [
        { icon: 'fas fa-times close-drop', label: 'Close', isClose: true },
        { icon: 'fas fa-dragon', label: 'Anime', path: '/anime' },
        { icon: 'fas fa-broadcast-tower', label: 'LiveTV', path: '/livetv' },
        { icon: 'fas fa-heartbeat', label: 'Hentai', path: '/hentai' },
        { icon: 'fas fa-mask', label: '18+', path: '/18plus' },
        { icon: 'fas fa-futbol', label: 'Sports', path: '/sports' }, // New Sports item
      ],
    },
  ];

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    const isTouch = navigator.maxTouchPoints > 1 && window.innerWidth < 768;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || isTouch) {
      setIsMobile(true);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!isMobile) return null;

  // Navigate helper
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <>
      {/* External fonts */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap"
        rel="stylesheet"
      />

      <div className="floating-footer">
        {menuItems.map(({ icon, label, dropdown, path }) => (
          <div
            key={label}
            className="footer-btn"
            onClick={() => {
              if (dropdown) {
                setDropdownVisible(!dropdownVisible);
              } else if (path) {
                navigateTo(path);
              }
            }}
            ref={label === 'More' ? dropdownRef : undefined}
          >
            <i className={icon}></i>
            <span>{label}</span>
            {dropdown && dropdownVisible && (
              <div className="footer-dropdown show">
                {dropdown.map((item) => (
                  <div
                    key={item.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.isClose) {
                        setDropdownVisible(false);
                      } else if (item.path) {
                        navigateTo(item.path);
                      }
                    }}
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    // ...component remains the same...

<style>{`
  .floating-footer {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #0a0a0a;
    border: 2px solid #ff1a75;
    border-radius: 20px;
    /* Removed glow effect */
    box-shadow: none;
    display: flex;
    gap: 24px;
    padding: 12px 20px;
    z-index: 99999;
    font-family: 'Audiowide', cursive;
  }
  .footer-btn {
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    transition: transform 0.2s ease;
  }
  .footer-btn i {
    font-size: 18px;
    margin-bottom: 4px;
  }
  .footer-btn:hover {
    transform: scale(1.15);
  }
  .footer-dropdown {
    position: absolute;
    bottom: 45px;
    background: #111;
    border: 1px solid #ff1a75;
    border-radius: 10px;
    /* Removed glow effect */
    box-shadow: none;
    display: flex;
    flex-direction: column;
    padding: 6px;
    min-width: 130px;
    z-index: 100000;
  }
  .footer-dropdown div {
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s ease;
  }
  .footer-dropdown div:hover {
    background: #ff1a75;
  }
  .footer-dropdown div:first-child {
    justify-content: center;
    font-weight: bold;
    border-bottom: 1px solid #ff1a75;
    margin-bottom: 6px;
  }
  @media (min-width: 768px) {
    .floating-footer {
      display: none !important;
    }
  }
`}</style>

    </>
  );
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Main site footer */}
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

      {/* Mobile Floating Footer */}
      <FloatingMobileFooter />
    </>
  );
};

export default Footer;
