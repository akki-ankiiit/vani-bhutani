import VaniMark from "../layout/VaniMark";
import FlowerVideo from "../media/FlowerVideo";
/** Migrated reference markup. Interactions are managed by useSiteExperience. */
export default function ResidenceIntroduction() {
  return (
    <section data-bg="light" className="section clip theme_on-brand">
      <div className="container">
        <div data-video-playpause="" className="apart-info-w">
          <div className="apart-info-s">
            <div className="u-48" />
            <div className="divider">
              <div data-scroll-reveal="line" className="line-v" />
            </div>
            <div className="u-48" />
            <div className="grid">
              <div className="s_title">
                <p data-scroll-reveal="p" className="l1 a-center">
                  Vani Bhutani Designs — Surat, Gujarat
                </p>
              </div>
            </div>
            <div className="u-160" />
            <div className="grid">
              <div className="info-s_lead">
                <h3 data-scroll-reveal="p" className="h4 a-center">
                  Every space is an opportunity to create something meaningful — shaped by thoughtful detailing, material exploration and the way people live.
                </h3>
              </div>
            </div>
            <div className="u-160" />
            <div className="grid">
              <div className="info-s_desc">
                <p data-scroll-reveal="p" className="p1 a-center" />
                <div className="u-32" />
                <div className="s_logo">
                  <div data-scroll-reveal="ctn" className="logo_symbol ico-48">
                    <div className="logo w-embed">
                      <VaniMark />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="u-48" />
          </div>
          <div data-parallax="ctn-down" className="flower apart-info">
            <FlowerVideo variant="04" />
          </div>
        </div>
      </div>
    </section>
  );
}
