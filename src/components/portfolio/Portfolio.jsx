import { projects, projectTypes } from "../../data/projects";
import ProjectCard from "./ProjectCard";
import ProjectFilter from "./ProjectFilter";
import FlowerVideo from "../media/FlowerVideo";
export default function Portfolio() {
  const cities = [
    {
      value: "*",
      label: "All cities",
    },
    ...[...new Set(projects.map((project) => project.city))].map((city) => ({
      value: city.toLowerCase(),
      label: city,
    })),
  ];
  return (
    <section data-bg="light" className="section clip">
      <div className="container">
        <div className="apart-w">
          <div className="apart-s">
            <div className="u-48" />
            <div className="u-272" />
            <div className="grid">
              <div data-sort="" data-filter="" className="apart-s_cms">
                <div className="apart-s_title">
                  <h1 data-scroll-reveal="h" className="h1">
                    Our projects
                  </h1>
                  <div data-filter-count="" className="h1 b-desk">
                    {projects.length}
                  </div>
                </div>
                <div className="u-24" />
                <p className="p1 portfolio-intro">
                  Residential and commercial interiors by Vani Bhutani Designs —
                  from Surat and Vapi to Mumbai, completed between 2015 and 2026.
                </p>
                <div className="u-32" />
                <div className="apart-s_cms_filter">
                  <div className="apart-s_cms_filter_c">
                    <div className="grid _9-columns">
                      <ProjectFilter
                        label="Sector"
                        group="type"
                        options={projectTypes}
                      />
                      <ProjectFilter
                        label="Location"
                        group="city"
                        options={cities}
                      />
                      <ProjectFilter
                        label="Sort"
                        sorting
                        options={[
                          {
                            value: "relevant",
                            label: "Selected",
                          },
                          {
                            value: "area",
                            label: "Area: low to high",
                          },
                          {
                            value: "area",
                            order: "desc",
                            label: "Area: high to low",
                          },
                        ]}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    data-reset=""
                    className="studio-reset l2"
                  >
                    Reset
                  </button>
                </div>
                <div className="u-16" />
                <div data-scroll-reveal="ctn" className="apart-cms">
                  <div
                    data-sort-list=""
                    data-filter-list=""
                    role="list"
                    className="apart-cms_list"
                  >
                    {projects.map((project) => (
                      <ProjectCard key={project.slug} project={project} />
                    ))}
                  </div>
                </div>
                <div data-filter-empty="" className="portfolio-empty">
                  <h2 className="h4">Room for something new.</h2>
                  <p className="p1">
                    No projects match these filters. Reset to explore the full
                    portfolio.
                  </p>
                </div>
                <div className="u-160" />
              </div>
            </div>
          </div>
          <div className="flower apart">
            <FlowerVideo variant="05" />
          </div>
        </div>
      </div>
    </section>
  );
}
