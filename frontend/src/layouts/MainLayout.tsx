/**
 * App shell: header (logo + nav), main outlet for current route.
 * On small screens: hamburger opens a side panel with nav links.
 */
import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ROUTES } from "../constants";
import "../App.css";

export function MainLayout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isGallery = location.pathname === ROUTES.HOME;
  const isUpload = location.pathname === ROUTES.UPLOAD;

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <div className="app">
      <header className="app-header">
        <Link to={ROUTES.HOME} className="app-logo" onClick={closeMobileNav}>
          Video Gallery
        </Link>
        <nav className="app-nav" aria-label="Main">
          {isGallery ? (
            <span className="app-nav-current" aria-current="page">Gallery</span>
          ) : (
            <Link to={ROUTES.HOME}>Gallery</Link>
          )}
          {isUpload ? (
            <span className="app-nav-current" aria-current="page">Upload</span>
          ) : (
            <Link to={ROUTES.UPLOAD}>Upload</Link>
          )}
        </nav>
        <button
          type="button"
          className="app-nav-hamburger"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileNavOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div
        className="app-nav-mobile"
        data-open={mobileNavOpen}
        aria-hidden={!mobileNavOpen}
        onClick={closeMobileNav}
      >
        <div
          className="app-nav-mobile-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {isGallery ? (
            <span className="app-nav-mobile-current" aria-current="page">Gallery</span>
          ) : (
            <Link to={ROUTES.HOME} onClick={closeMobileNav}>Gallery</Link>
          )}
          {isUpload ? (
            <span className="app-nav-mobile-current" aria-current="page">Upload</span>
          ) : (
            <Link to={ROUTES.UPLOAD} onClick={closeMobileNav}>Upload</Link>
          )}
        </div>
      </div>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
