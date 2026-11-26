import SignupForm from "./SignupForm";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const { company } = await searchParams;

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Early access</p>
        <h1>
          Crypto, at the places you <span className="accent">already trust.</span>
        </h1>
        <p className="lede">
          Morcoin partners with businesses to make crypto a real part of how they operate, so
          using it feels as normal as tapping a card. Tell us where you work and join your
          company&apos;s waitlist.
        </p>
        <a href="#join" className="button">Join your company&apos;s waitlist</a>
      </section>

      <section className="pillars">
        <article>
          <h2>The problem</h2>
          <p>
            Crypto doesn&apos;t lack money or technology. It lacks everyday use. Most people
            treat it as something to speculate on, not something they spend, earn, or use.
          </p>
        </article>
        <article>
          <h2>Our angle</h2>
          <p>
            We don&apos;t try to convince people one at a time. We partner with businesses, and
            the customers and employees who already trust them become crypto&apos;s next users.
          </p>
        </article>
        <article>
          <h2>Our goal</h2>
          <p>
            Create demand, not just access. Plenty of companies already allow crypto, and
            almost no one uses it. We want crypto to be the option people choose.
          </p>
        </article>
      </section>

      <section className="offer">
        <h2 className="section-title">What you&apos;re getting in on</h2>
        <div className="offer-grid">
          <div className="offer-card">
            <h3>For people</h3>
            <ul>
              <li>Use crypto at the businesses you already go to, with no expertise required.</li>
              <li>Earn and spend it in ways that make sense day to day, not just hold it.</li>
              <li>A say in what we build: your survey answers shape the product.</li>
            </ul>
          </div>
          <div className="offer-card">
            <h3>For businesses</h3>
            <ul>
              <li>A partner that handles the hard parts of bringing crypto into your business.</li>
              <li>Real demand: see how many of your own people want it before you start.</li>
              <li>A way to reach customers who are looking for something new.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="how">
        <h2 className="section-title">How the waitlist works</h2>
        <ol className="steps">
          <li>
            <strong>Sign up with your email.</strong> That&apos;s the only contact detail we ask
            for. No name, phone number or address.
          </li>
          <li>
            <strong>Tell us where you work.</strong> You join a waitlist for your company, alongside
            your coworkers.
          </li>
          <li>
            <strong>Share it.</strong> The bigger your company&apos;s waitlist, the stronger the case
            for bringing Morcoin there first.
          </li>
        </ol>
      </section>

      <section id="join" className="join">
        <h2 className="section-title">Join the waitlist</h2>
        <SignupForm initialCompany={company ?? ""} />
      </section>
    </main>
  );
}
