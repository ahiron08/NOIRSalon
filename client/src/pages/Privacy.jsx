import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

export default function Privacy() {
  return (
    <>
      <PageHeader title="Privacy Policy" subtitle="Legal" />
      <Section>
        <div className="max-w-3xl space-y-4 text-noir-muted">
          <p>Your privacy matters. We collect only what is necessary to serve you — name, email, phone, and booking details — and never sell it.</p>
          <p>Payments are processed through abstracted providers (Cash, Razorpay, Stripe). Card data never touches our servers.</p>
          <p>Cookies are used to keep you signed in and to power the cart. No tracking pixels. No ad networks.</p>
          <p>Contact us at hello@noirsalon.in for any privacy request.</p>
        </div>
      </Section>
    </>
  );
}
