export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Terms of Service
      </h1>

      <p>
        By using QuoteMate AI, you agree to these terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Service Use
      </h2>

      <p>
        QuoteMate AI provides tools to help businesses create quotes.
        Users are responsible for reviewing quotes before sending them.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Payments
      </h2>

      <p>
        Paid subscriptions are processed through Stripe.
        Users may cancel subscriptions at any time.
      </p>
    </main>
  );
}