import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  HardHat,
  House,
  Layers3,
  MapPin,
  Menu,
  Ruler,
  ShieldCheck,
  Trash2,
  Truck,
  X,
  Building2,
  MoveUpRight,
} from "lucide-react";
import {
  company,
  faqs,
  processSteps,
  projectGallery,
  serviceAreas,
  services,
  type FAQ,
  type Service,
} from "./data/site";
import EstimateForm from "./components/EstimateForm";

const navItems = [
  { label: "Services", href: "/services/" },
  { label: "Our Work", href: "/our-work/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];
const serviceIcons = [Layers3, Ruler, House, Building2, HardHat, Truck];
export const routes = [
  "/",
  "/services/",
  ...services.map((service) => `/services/${service.slug}/`),
  "/our-work/",
  "/about/",
  "/contact/",
  "/privacy/",
];
export function normalizePath(path: string) {
  return path === "/" ? "/" : `/${path.split("/").filter(Boolean).join("/")}/`;
}
export function getMeta(path: string) {
  const service = services.find((item) => path === `/services/${item.slug}/`);
  if (service)
    return {
      title: `${service.title} in Toronto & the GTA | Precision Demolition`,
      description:
        service.summary +
        " Discuss your Toronto or GTA project with Precision Demolition.",
    };
  const pages: Record<string, { title: string; description: string }> = {
    "/": {
      title: "Precision Demolition | Toronto & the GTA",
      description:
        "Demolition. Done precisely. Residential, commercial and interior demolition in Toronto and the GTA. Plan your project with Precision Demolition.",
    },
    "/services/": {
      title: "Demolition Services in Toronto & the GTA | Precision Demolition",
      description:
        "Explore interior strip-outs, selective, residential and commercial demolition, concrete removal and debris removal. Start with a clearly defined scope.",
    },
    "/our-work/": {
      title: "Our Work | Precision Demolition",
      description:
        "The Precision Demolition project portfolio. Completed-project photography will be added when available. Explore our approach to planned demolition.",
    },
    "/about/": {
      title: "Our Approach | Precision Demolition",
      description:
        "A precise approach to demolition: clear planning, protection for retained spaces, and an agreed cleanup standard. Serving Toronto and the GTA.",
    },
    "/contact/": {
      title: "Request an Estimate | Precision Demolition",
      description:
        "Tell Precision Demolition about your Toronto or GTA project. Share your location, service needs and project scope to prepare an estimate enquiry.",
    },
    "/privacy/": {
      title: "Privacy & Your Enquiry | Precision Demolition",
      description:
        "Learn how your project enquiry is handled, how draft downloads work, and what happens when online submission becomes available.",
    },
  };
  return (
    pages[path] ?? {
      title: "Page Not Found | Precision Demolition",
      description:
        "Find demolition services, project information and the estimate form at Precision Demolition.",
    }
  );
}

function Logo() {
  return (
    <img
      className="brand-logo"
      src="/images/precision-logo.webp"
      width="286"
      height="94"
      alt="Precision Demolition"
      fetchPriority="high"
    />
  );
}
function Button({
  children,
  href = "/contact/#estimate",
  light = false,
  outline = false,
}: {
  children: ReactNode;
  href?: string;
  light?: boolean;
  outline?: boolean;
}) {
  return (
    <a
      className={`button ${outline ? "button-outline" : light ? "button-light" : "button-red"}`}
      href={href}
    >
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}
function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`eyebrow${light ? " eyebrow-light" : ""}`}>
      <span aria-hidden="true" />
      {children}
    </p>
  );
}
function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link" href={href}>
      {children}
      <ArrowUpRight size={19} aria-hidden="true" />
    </a>
  );
}

function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    function resize() {
      if (window.innerWidth > 900) setOpen(false);
    }
    window.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
    };
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="brand"
            href="/"
            aria-label="Precision Demolition — home"
          >
            <Logo />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={path.startsWith(item.href) ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-cta">
            <Button>Request an Estimate</Button>
          </div>
          <button
            className="menu-toggle"
            ref={menuButton}
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
          hidden={!open}
        >
          <a href="/" aria-current={path === "/" ? "page" : undefined}>
            Home
            <ArrowUpRight size={18} />
          </a>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={path.startsWith(item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
              <ArrowUpRight size={18} />
            </a>
          ))}
          <Button>Request an Estimate</Button>
        </nav>
      </header>
      <a className="mobile-estimate" href="/contact/#estimate">
        Request an Estimate <ArrowUpRight size={19} aria-hidden="true" />
      </a>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a
              className="brand footer-logo"
              href="/"
              aria-label="Precision Demolition — home"
            >
              <Logo />
            </a>
            <p>
              A considered approach.
              <br />A clean start.
            </p>
            <span className="footer-location">
              <MapPin size={14} />
              Toronto & the Greater Toronto Area
            </span>
          </div>
          <div>
            <h2>Explore</h2>
            <a href="/">Home</a>
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <div>
            <h2>Our services</h2>
            {services.map((service) => (
              <a key={service.slug} href={`/services/${service.slug}/`}>
                {service.title}
              </a>
            ))}
          </div>
          <div className="footer-project">
            <h2>Have a project in mind?</h2>
            <p>
              Start with a conversation.
              <br />
              We’ll take it from there.
            </p>
            <TextLink href="/contact/#estimate">
              Let’s talk about your project
            </TextLink>
            <p className="contact-placeholder">
              Direct contact details coming soon.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Precision Demolition.</span>
          <span>Demolition. Done precisely.</span>
          <a href="/privacy/">Privacy & your enquiry</a>
        </div>
      </div>
    </footer>
  );
}

function Hero() {
  return (
    <section className="hero container" aria-labelledby="hero-heading">
      <div className="hero-content">
        <Eyebrow>TORONTO & THE GTA</Eyebrow>
        <h1 id="hero-heading">
          Demolition.
          <br />
          Done precisely<span className="red-dot">.</span>
        </h1>
        <p className="hero-description">
          Making room for what comes next. Residential, commercial and interior
          demolition with a clear plan and a careful approach.
        </p>
        <div className="hero-actions">
          <Button>Request an Estimate</Button>
          <a className="hero-secondary" href="#services">
            Explore our services
            <ArrowDown size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="hero-bottom">
          <span className="small-cross" aria-hidden="true">
            +
          </span>
          <span>Clear scope. Considered work. A clean start.</span>
        </div>
      </div>
      <figure className="hero-visual">
        <div className="hero-image-wrap">
          <img
            src="/images/interior-demolition.webp"
            srcSet="/images/interior-demolition-768.webp 768w, /images/interior-demolition.webp 1536w"
            sizes="(max-width: 700px) 100vw, 52vw"
            width="1536"
            height="1024"
            alt="Illustrative interior demolition scene with exposed timber framing and natural light"
            fetchPriority="high"
          />
          <div className="photo-corner" aria-hidden="true">
            <MoveUpRight size={26} strokeWidth={1.4} />
          </div>
          <div className="hero-image-caption">
            <span className="tiny-label">PRECISION IN THE PROCESS</span>
            <p>
              Every new beginning
              <br />
              starts with a clear space.
            </p>
          </div>
        </div>
        <figcaption>
          Illustrative image. Not a completed Precision project.
        </figcaption>
      </figure>
    </section>
  );
}
function PrinciplesBar() {
  return (
    <div className="principles-bar">
      <div className="container principles-grid">
        {[
          {
            icon: Ruler,
            title: "Planned with purpose",
            body: "A clear scope before work starts.",
          },
          {
            icon: ShieldCheck,
            title: "Care where it counts",
            body: "Protection for what stays.",
          },
          {
            icon: Trash2,
            title: "Ready for what’s next",
            body: "Cleanup built into the plan.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <Icon size={29} strokeWidth={1.3} aria-hidden="true" />
            <span>
              <strong>{title}</strong>
              <small>{body}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function ServiceCards() {
  return (
    <div className="service-grid">
      {services.map((service, i) => {
        const Icon = serviceIcons[i];
        return (
          <a
            className="service-card"
            href={`/services/${service.slug}/`}
            key={service.slug}
          >
            <div className="service-card-top">
              <Icon size={32} strokeWidth={1.2} aria-hidden="true" />
              <span>{service.number}</span>
            </div>
            <h3>{service.title}</h3>
            <p>{service.summary}</p>
            <span className="service-card-bottom">
              Explore service
              <ArrowUpRight size={19} aria-hidden="true" />
            </span>
          </a>
        );
      })}
    </div>
  );
}
function ServicesSection() {
  return (
    <section className="section container" id="services">
      <div className="section-heading">
        <div>
          <Eyebrow>01 / OUR SERVICES</Eyebrow>
          <h2>
            The right approach.
            <br />
            For every removal.
          </h2>
        </div>
        <div className="section-heading-aside">
          <p>
            From a single room to a complete structure, every project starts
            with understanding what needs to go — and what needs to stay.
          </p>
          <TextLink href="/services/">View all services</TextLink>
        </div>
      </div>
      <ServiceCards />
    </section>
  );
}
function ApproachSection() {
  return (
    <section className="approach-section">
      <div className="container approach-grid">
        <figure className="approach-photo">
          <img
            src="/images/selective-demolition.webp"
            width="1536"
            height="1024"
            loading="lazy"
            alt="Illustrative renovation interior, opened up to its original timber structure"
          />
          <figcaption>Illustrative image · Not company work</figcaption>
        </figure>
        <div className="approach-content">
          <Eyebrow light>02 / THE PRECISION APPROACH</Eyebrow>
          <h2>
            More thought.
            <br />
            Less left to chance.
          </h2>
          <p>
            Good demolition starts long before the first wall comes down. It
            starts with understanding the building, the people around it, and
            the plan for what follows.
          </p>
          <div className="approach-points">
            {[
              {
                number: "01",
                title: "Plan the work.",
                text: "Define the scope, access, utilities and sequence before getting started.",
              },
              {
                number: "02",
                title: "Protect what stays.",
                text: "Identify retained finishes, neighbouring spaces and the protection each needs.",
              },
              {
                number: "03",
                title: "Finish with care.",
                text: "Agree on debris removal and cleanup so the next stage has a clear starting point.",
              },
            ].map((item) => (
              <div key={item.number}>
                <span>{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <TextLink href="/about/">Get to know our approach</TextLink>
        </div>
      </div>
    </section>
  );
}
function ProcessSection() {
  return (
    <section className="section container process-section">
      <div className="section-heading">
        <div>
          <Eyebrow>03 / HOW IT WORKS</Eyebrow>
          <h2>A clear path forward.</h2>
        </div>
        <p className="section-intro">
          Four straightforward steps.
          <br />
          One considered plan for your project.
        </p>
      </div>
      <div className="process-grid">
        {processSteps.map((step, i) => (
          <div className="process-step" key={step.number}>
            <div className="process-number">
              <span>{step.number}</span>
              {i < 3 && <ArrowRight size={21} aria-hidden="true" />}
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
function ProjectGallery({ full = false }: { full?: boolean }) {
  if (projectGallery.length)
    return (
      <div className="project-grid">
        {projectGallery.map((project) => (
          <figure key={project.slug}>
            <img
              src={project.image}
              alt={project.imageAlt}
              loading="lazy"
              width="1000"
              height="700"
            />
            <figcaption>
              <span>
                {project.location} / {project.service}
              </span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    );
  return (
    <div className={`portfolio-empty${full ? " portfolio-empty-full" : ""}`}>
      <div className="portfolio-drawing" aria-hidden="true">
        <div className="drawing-outline">
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="drawing-label">PRECISION / PROJECT ARCHIVE</span>
      </div>
      <div className="portfolio-message">
        <span className="tiny-label">REAL PROJECTS. REAL DETAILS.</span>
        <h3>
          Our project portfolio
          <br />
          is taking shape.
        </h3>
        <p>
          Completed-project photographs will be shared here as they become
          available. The illustrative images elsewhere on this site show the
          type of work, not Precision’s project history.
        </p>
        {!full && <TextLink href="/our-work/">Visit our work page</TextLink>}
      </div>
    </div>
  );
}
function WorkSection() {
  return (
    <section className="section work-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <Eyebrow>04 / OUR WORK</Eyebrow>
            <h2>
              Every space has
              <br />a next chapter.
            </h2>
          </div>
          <p className="section-intro">
            A place for the details, the process
            <br />
            and the finished result.
          </p>
        </div>
        <ProjectGallery />
      </div>
    </section>
  );
}

function ServiceArea() {
  return (
    <section className="section container area-section">
      <div className="area-heading">
        <Eyebrow>LOCAL FOCUS. CONSIDERED WORK.</Eyebrow>
        <h2>
          Toronto.
          <br />
          And the places
          <br />
          around it.
        </h2>
        <p>
          Planning a project in Toronto or the GTA? Share your location and
          scope. We’ll confirm service availability and site requirements during
          the assessment.
        </p>
        <TextLink href="/contact/#estimate">
          Tell us where you’re working
        </TextLink>
      </div>
      <div className="area-panel">
        <div className="area-panel-heading">
          <MapPin size={24} strokeWidth={1.4} />
          <span>OUR SERVICE AREA</span>
          <span className="area-coordinate">43.65° N / 79.38° W</span>
        </div>
        <div className="city-grid">
          {serviceAreas.map((city) => (
            <span key={city}>
              {city}
              <ArrowUpRight size={14} aria-hidden="true" />
            </span>
          ))}
        </div>
        <p>
          Don’t see your area? Include your project location in your enquiry.
        </p>
        <svg
          className="area-watermark-mark"
          viewBox="0 0 220 80"
          aria-hidden="true"
        >
          <path
            d="M58 17H25L10 32v32l15 9h33V43H35 M76 17h62M107 17v56 M145 73l24-56h12l25 56M156 49h39"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
          />
        </svg>
      </div>
    </section>
  );
}
function FAQList({ items = faqs }: { items?: FAQ[] }) {
  return (
    <div className="faq-list">
      {items.map((faq, i) => (
        <details key={faq.q}>
          <summary>
            <span className="faq-number">{String(i + 1).padStart(2, "0")}</span>
            <span>{faq.q}</span>
            <ChevronDown size={20} aria-hidden="true" />
          </summary>
          <p>{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
function FAQSection({ items = faqs }: { items?: FAQ[] }) {
  return (
    <section className="section faq-section container">
      <div>
        <Eyebrow>A LITTLE CLARITY</Eyebrow>
        <h2>
          Good questions.
          <br />
          Clear answers.
        </h2>
        <p>
          Some things worth knowing
          <br />
          before demolition begins.
        </p>
        <TextLink href="/contact/">Have another question?</TextLink>
      </div>
      <FAQList items={items} />
    </section>
  );
}
function EstimateSection({
  service,
  standalone = false,
}: {
  service?: string;
  standalone?: boolean;
}) {
  return (
    <section
      className={`estimate-section${standalone ? " estimate-standalone" : ""}`}
      id="estimate"
    >
      <div className="container estimate-layout">
        <div className="estimate-copy">
          <Eyebrow>
            {standalone
              ? "LET’S TALK ABOUT YOUR PROJECT"
              : "YOUR NEXT CHAPTER STARTS HERE"}
          </Eyebrow>
          <h2>
            Let’s make
            <br />
            room for
            <br />
            <span>what’s next.</span>
          </h2>
          <p>
            Tell us what you’re planning. We’ll start with your space, your
            priorities and a clear understanding of the work.
          </p>
          <div className="estimate-checklist">
            <span>
              <Check size={17} />
              Residential & commercial enquiries
            </span>
            <span>
              <Check size={17} />
              Toronto & the GTA
            </span>
            <span>
              <Check size={17} />A scope built around your project
            </span>
          </div>
          <div className="estimate-note">
            <span className="tiny-label">A USEFUL START</span>
            <p>
              Have drawings, measurements or site photos? Mention them in your
              enquiry. They can help clarify the scope during an assessment.
            </p>
          </div>
        </div>
        <div className="estimate-form-panel">
          <span className="tiny-label">REQUEST AN ESTIMATE</span>
          <h3>Tell us what you’re planning.</h3>
          <EstimateForm service={service} />
          <p className="privacy-link">
            Read about <a href="/privacy/">privacy & your enquiry</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <PrinciplesBar />
      <ServicesSection />
      <ApproachSection />
      <ProcessSection />
      <WorkSection />
      <ServiceArea />
      <FAQSection />
      <EstimateSection />
    </>
  );
}
function Breadcrumb({
  current,
  service = false,
}: {
  current: string;
  service?: boolean;
}) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span aria-hidden="true">/</span>
      {service && (
        <>
          <a href="/services/">Services</a>
          <span aria-hidden="true">/</span>
        </>
      )}
      <span aria-current="page">{current}</span>
    </nav>
  );
}
function PageIntro({
  eyebrow,
  title,
  children,
  current,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  current: string;
}) {
  return (
    <section className="page-intro container">
      <Breadcrumb current={current} />
      <div className="page-intro-grid">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1>{title}</h1>
        </div>
        <div className="page-intro-copy">{children}</div>
      </div>
    </section>
  );
}
function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="DEMOLITION, WITH A PLAN"
        title={
          <>
            Make room.
            <br />
            With precision.
          </>
        }
        current="Services"
      >
        <p>
          Every building is different. Every removal deserves a clear scope.
          Explore our services for homeowners, contractors and property managers
          across Toronto and the GTA.
        </p>
        <Button>Discuss your project</Button>
      </PageIntro>
      <section
        className="container services-page-grid"
        aria-label="Demolition services"
      >
        <ServiceCards />
        <p className="service-confirmation">
          Every project is assessed individually. Service availability, permits
          and the final scope are confirmed before work is scheduled.
        </p>
      </section>
      <ProcessSection />
      <EstimateSection />
    </>
  );
}
function ServicePage({ service }: { service: Service }) {
  return (
    <>
      <section className="service-hero container">
        <Breadcrumb current={service.title} service />
        <div className="service-hero-grid">
          <div>
            <Eyebrow>{service.number} / DEMOLITION SERVICES</Eyebrow>
            <h1>
              {service.title}
              <span className="red-dot">.</span>
            </h1>
            <p>{service.description}</p>
            <Button href={`/contact/?service=${service.slug}#estimate`}>
              Discuss your project
            </Button>
            <span className="service-hero-location">
              <MapPin size={15} />
              Toronto & the GTA
            </span>
          </div>
          <figure>
            <img
              src={`/images/${service.image}`}
              alt={service.imageAlt}
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <figcaption>
              Illustrative image. Not a completed Precision project.
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="section container service-details">
        <div>
          <Eyebrow>A CLEAR SCOPE</Eyebrow>
          <h2>
            What the work
            <br />
            can include.
          </h2>
          <p>
            Start with your goals. The assessment turns them into a defined
            removal scope, with responsibilities and exclusions made clear.
          </p>
        </div>
        <ul className="scope-list">
          {service.details.map((detail) => (
            <li key={detail}>
              <Check size={20} />
              {detail}
            </li>
          ))}
        </ul>
      </section>
      <section className="preparation-section">
        <div className="container preparation-layout">
          <div>
            <Eyebrow>BEFORE WORK BEGINS</Eyebrow>
            <h2>
              Plan the details.
              <br />
              Protect the outcome.
            </h2>
          </div>
          <div>
            {service.considerations.map((item, i) => (
              <div className="preparation-item" key={item}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FAQSection items={service.faq} />
      <section className="container related-services">
        <Eyebrow>LOOKING FOR SOMETHING ELSE?</Eyebrow>
        <div>
          {services
            .filter((item) => item.slug !== service.slug)
            .slice(0, 3)
            .map((item) => (
              <TextLink href={`/services/${item.slug}/`} key={item.slug}>
                {item.title}
              </TextLink>
            ))}
        </div>
      </section>
      <EstimateSection service={service.slug} />
    </>
  );
}
function WorkPage() {
  return (
    <>
      <PageIntro
        current="Our Work"
        eyebrow="THE PROJECT PORTFOLIO"
        title={
          <>
            The process.
            <br />
            The progress.
            <br />
            The result.
          </>
        }
      >
        <p>
          A closer look at real Precision projects, from the agreed scope to the
          space left ready for its next stage.
        </p>
        <p className="muted">
          Our completed-project gallery is being prepared. No illustrative
          photography is presented as company work.
        </p>
      </PageIntro>
      <section
        className="container work-page-gallery"
        aria-label="Completed-project gallery"
      >
        <ProjectGallery full />
      </section>
      <ApproachSection />
      <section className="compact-cta container">
        <div>
          <Eyebrow>LET’S TALK ABOUT YOUR SPACE</Eyebrow>
          <h2>Your next project starts here.</h2>
        </div>
        <Button>Request an Estimate</Button>
      </section>
    </>
  );
}
function AboutPage() {
  return (
    <>
      <PageIntro
        current="About"
        eyebrow="THE PRECISION APPROACH"
        title={
          <>
            A careful start.
            <br />A better next step.
          </>
        }
      >
        <p>
          Demolition is the first part of a bigger plan. Precision Demolition’s
          approach puts clear communication, thoughtful preparation and a
          defined finish at the centre of that work.
        </p>
        <p>
          For homeowners, contractors and property managers in Toronto and the
          GTA.
        </p>
      </PageIntro>
      <figure className="about-banner container">
        <img
          src="/images/selective-demolition.webp"
          width="1536"
          height="1024"
          alt="Illustrative exposed framing in a naturally lit interior renovation"
          loading="eager"
        />
        <figcaption>
          Illustrative image. Not a completed Precision project.
        </figcaption>
        <div>
          <span className="tiny-label">BUILT AROUND YOUR NEXT CHAPTER</span>
          <h2>
            Precision is
            <br />
            in the preparation.
          </h2>
        </div>
      </figure>
      <section className="section container about-values">
        <div>
          <Eyebrow>WHAT GUIDES THE WORK</Eyebrow>
          <h2>
            Clear expectations.
            <br />
            From the outset.
          </h2>
          <p>
            The right questions at the start make for a more useful scope and a
            clearer handover.
          </p>
        </div>
        <div>
          {[
            {
              title: "Clarity before commitment",
              text: "Identify the removal scope, the items to keep, site constraints and who is responsible for each prerequisite.",
            },
            {
              title: "Respect for the whole property",
              text: "Account for adjacent spaces, access routes, neighbours and the way a building is used.",
            },
            {
              title: "A defined finish",
              text: "Agree on debris handling, cleanup and the condition of the work area at handover.",
            },
          ].map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <ProcessSection />
      <EstimateSection />
    </>
  );
}
function ContactPage() {
  const [service, setService] = useState("");
  useEffect(() => {
    setService(
      new URLSearchParams(window.location.search).get("service") || "",
    );
  }, []);
  return (
    <>
      <div className="container">
        <Breadcrumb current="Contact" />
      </div>
      <section className="contact-heading container">
        <Eyebrow>CONTACT PRECISION DEMOLITION</Eyebrow>
        <h1>
          A good project starts
          <br />
          with a conversation<span className="red-dot">.</span>
        </h1>
        <p>
          Share your ideas, your site and what you need removed.
          <br />
          Let’s define the next step.
        </p>
      </section>
      <EstimateSection service={service} standalone />
      <section className="container direct-contact">
        <div>
          <MapPin />
          <h2>Where we work</h2>
          <p>
            Toronto & the Greater Toronto Area.
            <br />
            Project availability confirmed on assessment.
          </p>
        </div>
        <div>
          <h2>Phone</h2>
          {company.phone ? (
            <a href={`tel:${company.phone}`}>{company.phone}</a>
          ) : (
            <p>Phone number coming soon.</p>
          )}
        </div>
        <div>
          <h2>Email</h2>
          {company.email ? (
            <a href={`mailto:${company.email}`}>{company.email}</a>
          ) : (
            <p>Email address coming soon.</p>
          )}
        </div>
      </section>
      <FAQSection items={faqs.slice(0, 3)} />
    </>
  );
}
function PrivacyPage() {
  return (
    <article className="container legal-page">
      <Breadcrumb current="Privacy & your enquiry" />
      <Eyebrow>YOUR INFORMATION</Eyebrow>
      <h1>
        Privacy &<br />
        your enquiry.
      </h1>
      <p className="lead">
        Your project details should have a clear purpose: helping to understand
        and respond to your enquiry.
      </p>
      <h2>Preparing a draft</h2>
      <p>
        When the form says online enquiries are not open, your entries remain in
        the current browser page. Preparing an enquiry does not send the details
        to Precision Demolition. Downloading creates a text file on your device.
        The site does not intentionally save draft entries in browser storage;
        closing or refreshing the page may clear them.
      </p>
      <h2>Sending an enquiry</h2>
      <p>
        When online submission is enabled, the form sends your name, the contact
        details you provide, project location, selected service, project
        description, preferred timing and contact permission to the configured
        enquiry delivery service. The form shows success only when that service
        confirms acceptance. An enquiry does not confirm a booking or a price.
      </p>
      <h2>What to include</h2>
      <p>
        Share only the information needed to discuss the project. Do not include
        payment details, government identification, access codes or other
        sensitive information. At least one contact method is needed so the
        business can respond when delivery is available.
      </p>
      <h2>Website operation</h2>
      <p>
        This site does not include advertising trackers or analytics scripts.
        Fonts and images are served with the site. The hosting provider may
        process standard request information to serve pages and protect the
        service. The enquiry server briefly counts requests by network address
        to reduce abuse and does not intentionally log form contents.
      </p>
      <h2>Contact and retention details</h2>
      <p>
        Business contact details, the selected delivery provider and the
        applicable retention arrangements will be added before online enquiries
        open. Until then, the form provides the clearly labelled draft
        preparation option.
      </p>
      <TextLink href="/contact/">Return to the enquiry form</TextLink>
    </article>
  );
}
function NotFoundPage() {
  return (
    <section className="container not-found">
      <Eyebrow>404 / PAGE NOT FOUND</Eyebrow>
      <h1>
        Let’s get you
        <br />
        back on solid ground.
      </h1>
      <p>
        This page isn’t here. Find the service you need or start again from the
        homepage.
      </p>
      <div>
        <Button href="/">Back to home</Button>
        <Button href="/services/" outline>
          Explore services
        </Button>
      </div>
    </section>
  );
}

export default function App({ path: initialPath }: { path: string }) {
  const path = normalizePath(initialPath);
  const service = services.find((item) => path === `/services/${item.slug}/`);
  const page =
    path === "/" ? (
      <HomePage />
    ) : path === "/services/" ? (
      <ServicesPage />
    ) : service ? (
      <ServicePage service={service} />
    ) : path === "/our-work/" ? (
      <WorkPage />
    ) : path === "/about/" ? (
      <AboutPage />
    ) : path === "/contact/" ? (
      <ContactPage />
    ) : path === "/privacy/" ? (
      <PrivacyPage />
    ) : (
      <NotFoundPage />
    );
  useEffect(() => {
    const meta = getMeta(path);
    document.title = meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", meta.description);
  }, [path]);
  return (
    <>
      <Header path={path} />
      <main id="main-content" tabIndex={-1}>
        {page}
      </main>
      <Footer />
    </>
  );
}
