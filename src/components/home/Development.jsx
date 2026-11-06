import { publications } from "../../data/vani-content";
import FlowerVideo from "../media/FlowerVideo";
/** Migrated reference markup. Interactions are managed by useSiteExperience. */
export default function Development() {
  return (
    <section data-bg="light" className="section clip">
      <div className="container">
        <div data-video-playpause="" className="other-w">
          <div className="other-s">
            <div className="u-48" />
            <div className="grid">
              <div className="s_title">
                <p data-scroll-reveal="p" className="l1 a-center">
                  Published & recognised
                </p>
              </div>
            </div>
            <div className="u-48" />
            <div className="divider">
              <div data-scroll-reveal="line" className="line-v" />
            </div>
            <div className="u-64" />
            <div className="grid">
              <div className="other-s_cms">
                <div className="other-cms w-dyn-list">
                  <div role="list" className="other-cms_list w-dyn-items">
                    {publications.map((item) => (
                      <div
                        key={item.name}
                        role="listitem"
                        className="other-cms_list_item w-dyn-item"
                      >
                        <div data-accordion-card="" className="other-card">
                          <div className="other-card_name">
                            <div className="other-card_name_label">
                              <h4
                                data-scroll-reveal="h"
                                className="h3 a-center press-name"
                              >
                                {item.name}
                              </h4>
                              <div
                                data-scroll-reveal="ctn"
                                data-ico-plus=""
                                className="other-card_ico"
                              >
                                <div className="ico-16">
                                  <div className="ico w-embed">
                                    <svg
                                      width="100%"
                                      height="100%"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M8 2.66602C8.36819 2.66602 8.66699 2.96579 8.66699 3.33398V7.33301H12.667L12.8008 7.34668C13.1046 7.40886 13.3339 7.67787 13.334 8C13.334 8.36803 13.035 8.66673 12.667 8.66699H8.66699V12.667C8.66673 13.035 8.36803 13.334 8 13.334C7.63205 13.3339 7.33327 13.0349 7.33301 12.667V8.66699H3.33398C2.96579 8.66699 2.66602 8.36819 2.66602 8C2.6661 7.63188 2.96585 7.33301 3.33398 7.33301H7.33301V3.33398C7.33301 2.96585 7.63188 2.6661 8 2.66602Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            data-accordion-card="content"
                            className="other-card_info"
                          >
                            <div className="u-32" />
                            <div className="grid _6-columns">
                              <div className="other-card_info_desc">
                                {item.image && (
                                  <div
                                    data-accordion-card="ctn"
                                    className="press-thumb"
                                  >
                                    <img
                                      src={item.image.src}
                                      width={item.image.width}
                                      height={item.image.height}
                                      alt={item.image.alt}
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  </div>
                                )}
                                {item.image && <div className="u-32" />}
                                <p
                                  data-accordion-card="p"
                                  className="p1 a-center"
                                >
                                  {item.title}
                                </p>
                                {item.href && (
                                  <>
                                    <div className="u-16" />
                                    <p
                                      data-accordion-card="p"
                                      className="l1 a-center"
                                    >
                                      <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="press-link"
                                      >
                                        Read the feature ↗
                                      </a>
                                    </p>
                                  </>
                                )}
                                <div className="u-32" />
                                <div
                                  data-accordion-card="ctn"
                                  className="info_divider"
                                >
                                  <div className="line-h" />
                                </div>
                                <div className="u-48" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="u-160" />
          </div>
          <div data-parallax="ctn-down" className="flower other">
            <FlowerVideo variant="07" />
          </div>
        </div>
      </div>
    </section>
  );
}
