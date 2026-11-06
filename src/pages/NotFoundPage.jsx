import StudioLayout from "../components/layout/StudioLayout";

export default function NotFoundPage() {
  return (
    <StudioLayout showCta={false} breadcrumb="Not found">
      <section data-bg="light" className="section studio-legal">
        <div className="container">
          <p className="l2">Error 404</p>
          <h1 className="h2">
            This space
            <br />
            is still empty.
          </h1>
          <p>
            The page you are looking for has moved or never existed. Explore our
            residential and commercial interiors, or get in touch to discuss
            your space.
          </p>
          <nav className="not-found-links" aria-label="Helpful links">
            <a className="h5" href="/">
              Return home ↗
            </a>
            <a className="h5" href="/projects">
              View projects ↗
            </a>
            <a className="h5" href="/contact">
              Start a conversation ↗
            </a>
          </nav>
        </div>
      </section>
    </StudioLayout>
  );
}
