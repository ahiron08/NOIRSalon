import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/layout/Section.jsx';

export default function Terms() {
  return (
    <>
      <PageHeader title="Terms" subtitle="Legal" />
      <Section>
        <div className="max-w-3xl space-y-4 text-noir-muted">
          <p>By using NOIR SALON you agree to these terms. Services are subject to availability and pricing may change without notice.</p>
          <p>Cancellations within 24 hours of appointment may incur a fee. Memberships are non-transferable unless stated.</p>
          <p>Gift cards are valid for 12 months from purchase. Balance is redeemable against services and products.</p>
        </div>
      </Section>
    </>
  );
}
