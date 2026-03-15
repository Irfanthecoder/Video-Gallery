/**
 * 404: invalid path (e.g. /test). Shown inside layout so user can use nav.
 */
import { Link } from "react-router-dom";
import { ROUTES } from "../constants";

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">Page not found.</p>
      <Link to={ROUTES.HOME} className="not-found-link">
        Back to gallery
      </Link>
    </div>
  );
}
