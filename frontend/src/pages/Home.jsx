import { Link } from "react-router-dom";
import {
  Shield,
  BookOpen,
  Target,
  Users,
  AlertTriangle,
  Award,
} from "lucide-react";
import ShadcnFooter from "../components/ShadcnFooter";
import Testimonials from "../components/Testimonials";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <section
        className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat text-white"
        style={{
          backgroundImage: "url('/diaster.gif')",
        }}>
        <div className="absolute inset-0" style={{ backgroundColor: "#0009" }}></div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex rounded-full border border-white/35 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
            Disaster Readiness Platform
          </div>
          <h1 className="mb-6 text-4xl font-bold md:text-6xl">
            Be Prepared, Stay Safe
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-slate-100 md:text-2xl">
            Master disaster preparedness through interactive learning, realistic
            drills, and community engagement. Your safety education starts here.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100">
              Get Started
            </Link>
            <a
              href="https://ndma.gov.in/"
              target="_blank"
              rel="noopener noreferrer">
              <button className="inline-flex items-center justify-center rounded-xl border-2 border-white/80 bg-transparent px-8 py-4 text-lg font-semibold text-white transition hover:bg-white hover:text-slate-900">
                Learn More
              </button>
            </a>
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border/70 bg-card/80 px-6 py-12 text-center shadow-lg backdrop-blur md:px-10">
          <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
            Ready to Start Your Safety Journey?
          </h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Join thousands of students, teachers, and communities building
            resilience through education and preparation.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-block px-8 py-4 text-lg">
            Join Now – It's Free
          </Link>
        </div>
      </section>

      <ShadcnFooter />
    </div>
  );
};

export default Home;
