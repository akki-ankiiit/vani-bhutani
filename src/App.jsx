import { Suspense, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { routes } from "./data/routes";
import ExperienceShell from "./components/layout/ExperienceShell";
import { useSiteExperience } from "./hooks/useSiteExperience";
import { useContactForm } from "./hooks/useContactForm";

function PageExperience({ Component }) {
  const root = useRef(null);
  const { hash } = useLocation();
  useSiteExperience(root);
  useEffect(() => {
    if (!hash) return;
    const timer = setTimeout(
      () => document.querySelector(hash)?.scrollIntoView(),
      1600,
    );
    return () => clearTimeout(timer);
  }, [hash]);
  const handleSubmit = useContactForm();

  return (
    <div
      ref={root}
      data-barba="wrapper"
      className="transition-wrapper"
      onSubmit={handleSubmit}
    >
      <ExperienceShell />
      <Component />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      className="route-loading"
      role="status"
      aria-label="Loading Vani Bhutani Designs"
    >
      <span>
        VANI BHUTANI
        <br />
        DESIGNS
      </span>
    </div>
  );
}

function NotFound() {
  return (
    <main className="not-found">
      <p className="l2">VANI BHUTANI DESIGNS</p>
      <h1 className="h2">
        This space
        <br />
        is still empty.
      </h1>
      <a className="h5" href="/">
        Return home ↗
      </a>
    </main>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const transitioning = useRef(false);
  const route = routes.find(
    (item) =>
      item.path === location.pathname.replace(/\/$/, "") ||
      (item.path === "/" && location.pathname === "/"),
  );
  const [failure, setFailure] = useState(false);

  useEffect(() => {
    document.title = route?.title || "Page not found — Vani Bhutani Designs";
    transitioning.current = false;
  }, [route]);

  useEffect(() => {
    const handleNavigation = (event) => {
      const anchor = event.target.closest("a[href]");
      if (
        !anchor ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        anchor.hasAttribute("download") ||
        anchor.target === "_blank"
      )
        return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const target = new URL(anchor.href);
      if (target.origin !== window.location.origin) return;
      event.preventDefault();
      if (transitioning.current) return;
      if (
        target.pathname === location.pathname &&
        target.search === location.search
      ) {
        const section = target.hash && document.querySelector(target.hash);
        // Same-page section links (e.g. /#services from the menu): wait for
        // the menu modal to release its scroll lock, then glide to the section.
        if (section)
          setTimeout(() => section.scrollIntoView({ behavior: "smooth" }), 700);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      transitioning.current = true;
      gsap.to(document.querySelector("main"), {
        opacity: 0,
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : 0.8,
        ease: "power2.inOut",
        onComplete: () =>
          navigate(target.pathname + target.search + target.hash),
      });
    };
    document.addEventListener("click", handleNavigation);
    return () => document.removeEventListener("click", handleNavigation);
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const onFailure = () => setFailure(true);
    window.addEventListener("vite:preloadError", onFailure);
    return () => window.removeEventListener("vite:preloadError", onFailure);
  }, []);

  if (failure)
    return (
      <div className="not-found">
        <h1 className="h3">Please refresh</h1>
        <p>A new version of the studio website is available.</p>
        <button onClick={() => window.location.reload()}>Reload page</button>
      </div>
    );
  if (!route) return <NotFound />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <PageExperience key={location.pathname} Component={route.Component} />
    </Suspense>
  );
}
