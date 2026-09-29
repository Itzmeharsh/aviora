export function generateResumeHTML(resume: any) {
  const escapeHTML = (value: string = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const normalizeURL = (value: string = "") => {
    if (!value) return "";

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:")
    ) {
      return value;
    }

    return `https://${value}`;
  };

  const contactItems: string[] = [];

  if (resume.personal?.phone) {
    contactItems.push(
      `<a href="tel:${escapeHTML(
        resume.personal.phone.replace(/\s+/g, "")
      )}">${escapeHTML(resume.personal.phone)}</a>`
    );
  }

  if (resume.personal?.email) {
    contactItems.push(
      `<a href="mailto:${escapeHTML(
        resume.personal.email
      )}">${escapeHTML(resume.personal.email)}</a>`
    );
  }

  if (resume.personal?.location) {
    contactItems.push(
      `<span>${escapeHTML(resume.personal.location)}</span>`
    );
  }

  const profileLinks: string[] = [];

  if (resume.personal?.linkedin) {
    profileLinks.push(
      `<a href="${escapeHTML(
        normalizeURL(resume.personal.linkedin)
      )}">LinkedIn</a>`
    );
  }

  if (resume.personal?.github) {
    profileLinks.push(
      `<a href="${escapeHTML(
        normalizeURL(resume.personal.github)
      )}">GitHub</a>`
    );
  }

  if (resume.personal?.portfolio) {
    profileLinks.push(
      `<a href="${escapeHTML(
        normalizeURL(resume.personal.portfolio)
      )}">Portfolio</a>`
    );
  }

  return `
<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8" />

<title>
${escapeHTML(resume.personal?.name || "Resume")}
</title>

<style>

@page {
  size: A4;
  margin: 12mm 15mm;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;

  font-family:
    "Times New Roman",
    Times,
    serif;

  color: #000;

  font-size: 10pt;

  line-height: 1.28;
}

.resume {
  width: 100%;
}

/* ================= HEADER ================= */

.header {
  text-align: center;

  margin-bottom: 12px;
}

.name {
  font-size: 21px;

  font-weight: bold;

  margin-bottom: 4px;
}

.contact {
  font-size: 9.5pt;

  display: flex;

  justify-content: center;

  align-items: center;

  flex-wrap: wrap;

  gap: 5px;
}

.contact a,
.profile-links a,
.project-title a {
  color: #000;

  text-decoration: none;
}

.separator {
  margin: 0 2px;
}

.profile-links {
  margin-top: 3px;

  font-size: 9.5pt;

  display: flex;

  justify-content: center;

  gap: 12px;
}

/* ================= SECTION ================= */

.section {
  margin-top: 10px;
}

.section-title {
  font-size: 11pt;

  font-weight: bold;

  margin-bottom: 4px;

  border-bottom: 0.8px solid #000;

  padding-bottom: 2px;
}

/* ================= EDUCATION ================= */

.education-item {
  margin-bottom: 6px;
}

.education-header {
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 15px;
}

.education-institution {
  font-weight: bold;

  font-size: 10.2pt;
}

.education-degree {
  font-size: 10pt;

  margin-top: 1px;
}

.education-date {
  white-space: nowrap;

  text-align: right;

  font-size: 9.5pt;
}

/* ================= EXPERIENCE ================= */

.experience-item {
  margin-bottom: 8px;
}

.experience-header {
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 15px;
}

.experience-company {
  font-weight: bold;

  font-size: 10.2pt;
}

.experience-role {
  font-size: 10pt;

  margin-top: 1px;
}

.experience-date {
  white-space: nowrap;

  text-align: right;

  font-size: 9.5pt;
}

.experience-location {
  font-size: 9.5pt;

  margin-top: 1px;
}

ul {
  margin-top: 3px;

  margin-bottom: 0;

  padding-left: 17px;
}

li {
  margin-bottom: 2px;

  padding-left: 1px;
}

/* ================= PROJECTS ================= */

.project-item {
  margin-bottom: 8px;
}

.project-header {
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 15px;
}

.project-title {
  font-weight: bold;

  font-size: 10.2pt;
}

.project-location {
  font-size: 9.5pt;

  white-space: nowrap;
}

.project-technologies {
  font-size: 9.5pt;

  margin-top: 1px;
}

.project-description {
  margin-top: 2px;
}

.project-link {
  margin-top: 2px;

  font-size: 9pt;
}

.project-link a {
  color: #000;

  text-decoration: underline;
}

/* ================= EXTRACURRICULAR ================= */

.extracurricular-list {
  margin-top: 2px;
}

/* ================= SKILLS ================= */

.skill-row {
  margin-bottom: 2px;

  font-size: 10pt;
}

.skill-label {
  font-weight: bold;
}

/* ================= CERTIFICATIONS ================= */

.certification-item {
  margin-bottom: 4px;
}

.certification-name {
  font-weight: bold;
}

.certification-meta {
  font-size: 9.5pt;
}

/* ================= PRINT ================= */

@media print {

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

}

</style>

</head>

<body>

<div class="resume">

  <!-- ================= HEADER ================= -->

  <header class="header">

    <div class="name">
      ${escapeHTML(
        resume.personal?.name || ""
      )}
    </div>

    ${
      contactItems.length
        ? `
      <div class="contact">

        ${contactItems
          .map(
            (item, index) => `
              ${
                index > 0
                  ? `<span class="separator">|</span>`
                  : ""
              }

              ${item}
            `
          )
          .join("")}

      </div>
    `
        : ""
    }

    ${
      profileLinks.length
        ? `
      <div class="profile-links">

        ${profileLinks
          .map(
            (link) => `<span>${link}</span>`
          )
          .join("")}

      </div>
    `
        : ""
    }

  </header>


  <!-- ================= EDUCATION ================= -->

  ${
    resume.education?.length
      ? `
    <section class="section">

      <div class="section-title">
        Education
      </div>

      ${resume.education
        .map(
          (education: any) => `
        <div class="education-item">

          <div class="education-header">

            <div>

              <div class="education-institution">
                ${escapeHTML(
                  education.institution
                )}
              </div>

              <div class="education-degree">

                ${escapeHTML(
                  education.degree
                )}

                ${
                  education.field
                    ? ` in ${escapeHTML(
                        education.field
                      )}`
                    : ""
                }

                ${
                  education.grade
                    ? `, ${escapeHTML(
                        education.grade
                      )}`
                    : ""
                }

              </div>

              ${
                education.location
                  ? `
                <div class="education-degree">
                  ${escapeHTML(
                    education.location
                  )}
                </div>
              `
                  : ""
              }

            </div>

            <div class="education-date">

              ${escapeHTML(
                education.startYear
              )}

              -

              ${escapeHTML(
                education.endYear
              )}

            </div>

          </div>

        </div>
      `
        )
        .join("")}

    </section>
  `
      : ""
  }


  <!-- ================= EXPERIENCE ================= -->

  ${
    resume.experience?.length
      ? `
    <section class="section">

      <div class="section-title">
        Experience
      </div>

      ${resume.experience
        .map(
          (experience: any) => `
        <div class="experience-item">

          <div class="experience-header">

            <div>

              <div class="experience-company">
                ${escapeHTML(
                  experience.company
                )}
              </div>

              <div class="experience-role">
                ${escapeHTML(
                  experience.role
                )}
              </div>

              ${
                experience.location
                  ? `
                <div class="experience-location">
                  ${escapeHTML(
                    experience.location
                  )}
                </div>
              `
                  : ""
              }

            </div>

            <div class="experience-date">

              ${escapeHTML(
                experience.startDate
              )}

              -

              ${escapeHTML(
                experience.endDate
              )}

            </div>

          </div>

          ${
            experience.description?.length
              ? `
            <ul>

              ${experience.description
                .map(
                  (description: string) =>
                    `<li>${escapeHTML(
                      description
                    )}</li>`
                )
                .join("")}

            </ul>
          `
              : ""
          }

        </div>
      `
        )
        .join("")}

    </section>
  `
      : ""
  }


  <!-- ================= PROJECTS ================= -->

  ${
    resume.projects?.length
      ? `
    <section class="section">

      <div class="section-title">
        Project
      </div>

      ${resume.projects
        .map(
          (project: any) => `
        <div class="project-item">

          <div class="project-header">

            <div class="project-title">

              ${
                project.url
                  ? `
                  <a href="${escapeHTML(
                    normalizeURL(
                      project.url
                    )
                  )}">
                    ${escapeHTML(
                      project.name
                    )}
                  </a>
                `
                  : escapeHTML(
                      project.name
                    )
              }

            </div>

          </div>

          ${
            project.technologies?.length
              ? `
              <div class="project-technologies">

                ${escapeHTML(
                  project.technologies.join(
                    ", "
                  )
                )}

              </div>
            `
              : ""
          }

          ${
            project.description
              ? `
              <div class="project-description">

                ${escapeHTML(
                  project.description
                )}

              </div>
            `
              : ""
          }

          ${
            project.highlights?.length
              ? `
              <ul>

                ${project.highlights
                  .map(
                    (
                      highlight: string
                    ) =>
                      `<li>${escapeHTML(
                        highlight
                      )}</li>`
                  )
                  .join("")}

              </ul>
            `
              : ""
          }

        </div>
      `
        )
        .join("")}

    </section>
  `
      : ""
  }


  <!-- ================= EXTRACURRICULAR ================= -->

  ${
    resume.extracurricular?.length
      ? `
    <section class="section">

      <div class="section-title">
        Extracurricular
      </div>

      <ul class="extracurricular-list">

        ${resume.extracurricular
          .map(
            (item: string) =>
              `<li>${escapeHTML(
                item
              )}</li>`
          )
          .join("")}

      </ul>

    </section>
  `
      : ""
  }


  <!-- ================= ACHIEVEMENTS ================= -->

  ${
    resume.achievements?.length
      ? `
    <section class="section">

      <div class="section-title">
        Achievements
      </div>

      <ul>

        ${resume.achievements
          .map(
            (achievement: string) =>
              `<li>${escapeHTML(
                achievement
              )}</li>`
          )
          .join("")}

      </ul>

    </section>
  `
      : ""
  }


  <!-- ================= SKILLS & INTERESTS ================= -->

  ${
    resume.skills &&
    (
      resume.skills.technical?.length ||
      resume.skills.analytical?.length
    )
      ? `
    <section class="section">

      <div class="section-title">
        Skills & Interests
      </div>

      ${
        resume.skills.technical?.length
          ? `
          <div class="skill-row">

            <span class="skill-label">
              Technical Skills:
            </span>

            ${escapeHTML(
              resume.skills.technical.join(
                ", "
              )
            )}

          </div>
        `
          : ""
      }

      ${
        resume.skills.analytical?.length
          ? `
          <div class="skill-row">

            <span class="skill-label">
              Analytical Skills:
            </span>

            ${escapeHTML(
              resume.skills.analytical.join(
                ", "
              )
            )}

          </div>
        `
          : ""
      }

    </section>
  `
      : ""
  }

</div>

</body>

</html>
`;
}