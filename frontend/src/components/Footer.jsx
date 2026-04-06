import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/75 py-10 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 px-4 md:grid-cols-2 md:px-6 lg:grid-cols-4 lg:pl-[18.5rem] lg:pr-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">DisasterPrep</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Empowering communities through practical preparedness education, data-informed alerts, and coordinated resilience planning.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            <li>
              <Link to="/dashboard" className="transition hover:text-primary">Dashboard</Link>
            </li>
            <li>
              <Link to="/modules" className="transition hover:text-primary">Learning Modules</Link>
            </li>
            <li>
              <Link to="/drills" className="transition hover:text-primary">Drill Simulations</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Resources</h4>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            <li>
              <Link to="/alerts" className="transition hover:text-primary">Alert Center</Link>
            </li>
            <li>
              <Link to="/resilience/resources" className="transition hover:text-primary">Resource Locator</Link>
            </li>
            <li>
              <Link to="/resilience/checklist" className="transition hover:text-primary">Preparedness Checklist</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Support</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            Email: support@disasterprep.com
            <br />
            Emergency: 112
          </p>
          <a
            href="https://ndma.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-semibold text-primary transition hover:text-primary/80"
          >
            National Disaster Management Authority
          </a>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[1600px] border-t border-border/70 px-4 pt-5 text-xs text-muted-foreground md:px-6 lg:pl-[18.5rem] lg:pr-8">
        <p>© {year} DisasterPrep. Built for resilient, safety-ready communities.</p>
      </div>
    </footer>
  );
};

export default Footer;
