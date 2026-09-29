import Link from "next/link";

const sections = [
  {
    number: "01",
    title: "Information We Collect",
    content: (
      <>
        <p>
          When you use Aviora, we collect information that you provide to us
          and information that is generated through your use of the service.
        </p>

        <h3>Account information</h3>

        <p>
          When you create or access an Aviora account using Google Sign-In,
          Aviora may receive information made available through your Google
          account authorization, including your name, email address, profile
          image, and identifiers required to authenticate your account.
        </p>

        <h3>Resume and career information</h3>

        <p>
          When you upload a resume, Aviora processes the information contained
          in that resume. This may include your name, contact information,
          location, professional links, education, employment history, skills,
          projects, certifications, achievements, and other information that
          you choose to include in your resume.
        </p>

        <h3>Job and application information</h3>

        <p>
          When you use Aviora to analyze or discover job opportunities, we may
          process job URLs, job descriptions, job titles, company information,
          job requirements, matching information, saved jobs, and application
          status information.
        </p>

        <h3>Generated information</h3>

        <p>
          Aviora may generate information based on your profile and the jobs
          you analyze, including skill matches, missing skills, match
          explanations, tailored resume content, and other career-related
          outputs.
        </p>

        <h3>Technical information</h3>

        <p>
          We may collect limited technical information necessary to operate,
          secure, and maintain Aviora. This may include IP address, browser
          type, device information, timestamps, authentication information,
          and technical or security logs.
        </p>
      </>
    ),
  },

  {
    number: "02",
    title: "How We Use Your Information",
    content: (
      <>
        <p>
          Aviora uses your information to provide, maintain, secure, and
          improve the services you request.
        </p>

        <ul>
          <li>
            Create and maintain your Aviora account.
          </li>

          <li>
            Authenticate you and maintain your signed-in session.
          </li>

          <li>
            Process your resume and create your personalized career profile.
          </li>

          <li>
            Understand your skills, experience, education, projects, and other
            professional information.
          </li>

          <li>
            Analyze job opportunities against your career profile.
          </li>

          <li>
            Identify matching skills, missing skills, and relevant experience.
          </li>

          <li>
            Generate tailored resumes and other career-related materials.
          </li>

          <li>
            Store and display jobs and application information that you choose
            to save.
          </li>

          <li>
            Maintain the security and reliability of the Aviora service.
          </li>

          <li>
            Detect and prevent fraud, abuse, unauthorized access, and security
            incidents.
          </li>

          <li>
            Respond to support requests and communicate with you about your
            account or the service.
          </li>
        </ul>

        <p>
          Aviora does not make employment decisions on behalf of employers.
          The service provides tools and information intended to assist you in
          making your own career decisions.
        </p>
      </>
    ),
  },

  {
    number: "03",
    title: "Artificial Intelligence",
    content: (
      <>
        <p>
          Aviora uses artificial intelligence to provide features including
          resume understanding, candidate-profile generation, job analysis,
          skill matching, and tailored resume generation.
        </p>

        <p>
          Information relevant to the feature you request may be processed by
          third-party artificial-intelligence service providers. Aviora
          currently uses OpenAI services for certain AI-powered features.
        </p>

        <p>
          Depending on the feature, information sent for AI processing may
          include information from your resume, career profile, skills,
          experience, projects, and the job opportunity you are analyzing.
        </p>

        <p>
          Aviora sends information reasonably necessary to provide the
          requested AI feature.
        </p>

        <p>
          According to OpenAI's applicable API data-use policies, API inputs
          and outputs are not used to train or improve OpenAI models by default
          unless the API customer explicitly opts in.
        </p>

        <p>
          Third-party AI providers may nevertheless retain certain information
          for purposes such as abuse prevention, security, and service
          monitoring in accordance with their applicable policies and data
          controls.
        </p>

        <p>
          AI-generated information may contain errors or omissions. You are
          responsible for reviewing generated resumes, job analyses, and other
          career materials before relying on or submitting them.
        </p>
      </>
    ),
  },

  {
    number: "04",
    title: "Google Account Data",
    content: (
      <>
        <p>
          Aviora currently uses Google Sign-In to allow users to create and
          access their Aviora accounts.
        </p>

        <p>
          Through Google authentication, Aviora may receive information such as
          your name, email address, profile image, and account identifiers
          required to authenticate your account.
        </p>

        <p>
          Aviora uses this information to create and maintain your account,
          authenticate your identity, display your account information, and
          provide the Aviora service.
        </p>

        <p>
          Aviora does not currently request access to Gmail messages, Google
          Drive files, Google Calendar, Google Contacts, or other Google
          services that are not necessary for authentication.
        </p>

        <p>
          Aviora does not sell Google user data or use Google account data for
          advertising.
        </p>

        <p>
          If Aviora introduces additional Google integrations in the future,
          the permissions requested and the corresponding uses of data will be
          disclosed before the additional access is requested.
        </p>
      </>
    ),
  },

  {
    number: "05",
    title: "How We Share Information",
    content: (
      <>
        <p>
          We do not sell your personal information.
        </p>

        <p>
          We may provide personal information to trusted service providers
          that process information on our behalf and help us operate Aviora.
        </p>

        <p>
          Depending on the services we use, these providers may include
          authentication providers, database and hosting providers,
          artificial-intelligence providers, security providers, file
          processing services, and communications providers.
        </p>

        <p>
          Service providers are given access to information only to the extent
          reasonably necessary to perform services for Aviora.
        </p>

        <p>
          We may also disclose information when reasonably necessary to comply
          with applicable law, respond to lawful requests, enforce our
          agreements, protect the rights or safety of Aviora or its users, or
          investigate fraud, abuse, or security incidents.
        </p>

        <p>
          If Aviora becomes involved in a merger, acquisition, financing,
          restructuring, sale of assets, or similar transaction, information
          may be transferred as part of that transaction, subject to
          applicable legal requirements.
        </p>
      </>
    ),
  },

  {
    number: "06",
    title: "Data Security",
    content: (
      <>
        <p>
          We use reasonable technical and organizational measures designed to
          protect personal information against unauthorized access, loss,
          misuse, alteration, or disclosure.
        </p>

        <p>
          These measures may include authenticated access controls, encrypted
          connections, database access controls, secure credential handling,
          and security monitoring.
        </p>

        <p>
          Authentication credentials and security secrets are not intentionally
          exposed to other users.
        </p>

        <p>
          However, no internet-based service can guarantee absolute security.
          You should therefore avoid uploading information to Aviora that you
          do not want processed as part of the service.
        </p>
      </>
    ),
  },

  {
    number: "07",
    title: "Data Retention",
    content: (
      <>
        <p>
          We retain personal information for as long as reasonably necessary
          to provide the Aviora service, maintain your account, comply with
          applicable legal obligations, resolve disputes, enforce agreements,
          and protect the security of the service.
        </p>

        <p>
          While your account is active, information such as your resume,
          career profile, saved jobs, application information, and generated
          career materials may remain associated with your account.
        </p>

        <p>
          When you request deletion of your account, we will delete or
          anonymize personal information that we are not required or otherwise
          permitted to retain, subject to applicable legal, security, and
          operational requirements.
        </p>

        <p>
          Certain information may remain temporarily in backups, disaster
          recovery systems, or security logs until those systems are routinely
          overwritten or otherwise processed according to applicable retention
          practices.
        </p>
      </>
    ),
  },

  {
    number: "08",
    title: "Your Privacy Rights and Choices",
    content: (
      <>
        <p>
          Depending on applicable law, you may have rights relating to your
          personal information, including rights to request access,
          correction, updating, or deletion of your information.
        </p>

        <p>
          You may also have the right to withdraw consent where processing is
          based on consent, subject to applicable law and the consequences of
          withdrawing that consent.
        </p>

        <p>
          You may request deletion of your Aviora account and associated
          personal information using the account-deletion functionality
          provided by Aviora or through our external account-deletion
          resource.
        </p>

        <p>
          We may need to verify your identity before completing certain
          privacy requests.
        </p>

        <p>
          To submit a privacy request or ask a question about your personal
          information, contact us using the privacy contact information
          provided on this page.
        </p>
      </>
    ),
  },

  {
    number: "09",
    title: "Account Deletion",
    content: (
      <>
        <p>
          You can request deletion of your Aviora account and associated
          personal information.
        </p>

        <p>
          Account deletion is intended to remove information associated with
          your account, including your candidate profile, resume-derived
          information, saved job information, application information, and
          other personal information maintained by Aviora, subject to
          applicable legal or security requirements.
        </p>

        <p>
          Account deletion may not immediately remove information that must be
          retained for legal compliance, fraud prevention, security, dispute
          resolution, or other legitimate purposes.
        </p>

        <p>
          To request account deletion, visit our account deletion page:
        </p>

        <Link
          href="/delete-account"
          className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        >
          Delete your Aviora account →
        </Link>
      </>
    ),
  },

  {
    number: "10",
    title: "Children's Privacy",
    content: (
      <>
        <p>
          Aviora is intended for adults and is not directed toward children.
        </p>

        <p>
          We do not knowingly request or collect personal information from
          children in violation of applicable law.
        </p>

        <p>
          If you believe that a child has provided personal information to
          Aviora, please contact us so that we can review the situation and
          take appropriate action.
        </p>
      </>
    ),
  },

  {
    number: "11",
    title: "Third-Party Services",
    content: (
      <>
        <p>
          Aviora relies on selected third-party services to operate portions
          of the platform.
        </p>

        <p>
          These services may process information on our behalf and may have
          their own privacy policies and terms.
        </p>

        <p>
          Current examples include Google for authentication and OpenAI for
          certain AI-powered processing.
        </p>

        <p>
          Third-party websites or services that you access through links in
          Aviora are governed by their own privacy policies. Aviora is not
          responsible for the privacy practices of independent third parties.
        </p>
      </>
    ),
  },

  {
    number: "12",
    title: "International Data Processing",
    content: (
      <>
        <p>
          Some third-party service providers used by Aviora may process
          information in countries other than the country in which you live.
        </p>

        <p>
          Where personal information is transferred across jurisdictions, we
          take reasonable steps to use appropriate safeguards and comply with
          applicable data-protection requirements.
        </p>
      </>
    ),
  },

  {
    number: "13",
    title: "Changes to This Privacy Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy when our services, technology,
          data practices, or legal obligations change.
        </p>

        <p>
          When we make material changes, we will update the effective date
          shown at the beginning of this policy and, where appropriate,
          provide additional notice through Aviora.
        </p>

        <p>
          We encourage you to review this page periodically to understand the
          current privacy practices of Aviora.
        </p>
      </>
    ),
  },

  {
    number: "14",
    title: "Contact Us",
    content: (
      <>
        <p>
          If you have questions about this Privacy Policy, want to exercise a
          privacy right, or want to request deletion of your account, please
          contact us.
        </p>

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30">
            Privacy contact
          </p>

          <a
            href="mailto:privacy@YOUR-DOMAIN.com"
            className="mt-3 inline-block text-sm text-amber-300 transition hover:text-amber-200"
          >
            HARSHBROYT@GMAIL.COM
          </a>
        </div>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-amber-500/[0.045] blur-[150px]" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[500px] w-[500px] rounded-full bg-orange-500/[0.02] blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-400/10">
            <span className="text-sm font-bold text-amber-300">
              A
            </span>
          </div>

          <div>
            <div className="text-[17px] font-semibold tracking-tight">
              Aviora
            </div>

            <div className="text-[9px] uppercase tracking-[0.25em] text-white/35">
              Career Intelligence
            </div>
          </div>
        </Link>

        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.035] px-5 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
        >
          Back to Aviora
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-24 sm:pt-32">
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-amber-300/60">
          <span className="h-px w-8 bg-amber-300/40" />
          Privacy
        </div>

        <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">
          Your data.
          <br />
          <span className="text-white/35">
            Your career.
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-8 text-white/45 sm:text-lg">
          We built Aviora around your professional information. This Privacy
          Policy explains what information we collect, why we use it, how we
          protect it, and the choices available to you.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/30">
          <span className="rounded-full border border-white/[0.07] px-4 py-2">
            Effective: September 29, 2026
          </span>

          <span className="rounded-full border border-white/[0.07] px-4 py-2">
            Last updated: September 29, 2026
          </span>
        </div>
      </section>

      {/* Policy */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-16 px-6 pb-32 lg:grid-cols-[220px_1fr]">
        {/* Contents */}
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/25">
              Contents
            </p>

            <nav className="mt-5 space-y-3">
              {sections.map((section) => (
                <a
                  key={section.number}
                  href={`#section-${section.number}`}
                  className="block text-xs text-white/35 transition hover:text-white/70"
                >
                  <span className="mr-2 text-amber-300/40">
                    {section.number}
                  </span>

                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="max-w-3xl">
          <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.018] p-6 sm:p-10 lg:p-12">
            <div className="space-y-16">
              {sections.map((section) => (
                <article
                  key={section.number}
                  id={`section-${section.number}`}
                  className="scroll-mt-8"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-amber-300/45">
                      {section.number}
                    </span>

                    <div className="h-px flex-1 bg-white/[0.06]" />
                  </div>

                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.025em]">
                    {section.title}
                  </h2>

                  <div className="mt-6 space-y-5 text-[15px] leading-8 text-white/48 [&_h3]:pt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white/75 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-3">
                    {section.content}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Aviora
          </span>

          <div className="flex gap-6">
            <Link
              href="/about"
              className="transition hover:text-white/70"
            >
              About
            </Link>

            <Link
              href="/privacy"
              className="text-white/60"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-white/70"
            >
              Terms
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-white/70"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}