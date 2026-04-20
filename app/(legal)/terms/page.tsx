import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'DrawVault Terms of Service — your rights and responsibilities when using our platform.',
}

export default function TermsPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground text-sm">Last updated: April 2026</p>

      <p>
        By using DrawVault (&ldquo;the Service&rdquo;) you agree to these Terms of Service.
        If you do not agree, do not use the Service.
      </p>

      <h2>Use of the Service</h2>
      <p>
        DrawVault provides tools to create giveaway and raffle forms and run live prize draws.
        You may use the Service for lawful purposes only. You agree not to:
      </p>
      <ul>
        <li>Use the Service for fraudulent, misleading, or illegal purposes</li>
        <li>Collect personal data from minors under 13 without parental consent</li>
        <li>Use automated tools to generate fake entries</li>
        <li>Violate any applicable laws or third-party rights</li>
        <li>Attempt to gain unauthorised access to any part of the Service</li>
      </ul>

      <h2>Accounts</h2>
      <p>
        You are responsible for maintaining the security of your account credentials.
        You are responsible for all activity that occurs under your account.
      </p>

      <h2>Free Plan &amp; Paid Plans</h2>
      <p>
        The Free plan provides limited features at no charge. Paid plans (Pro, Business)
        are billed monthly or yearly via Stripe. You may cancel at any time; your plan
        remains active until the end of the billing period. We offer a 14-day money-back
        guarantee on all paid plans.
      </p>

      <h2>Content You Create</h2>
      <p>
        You retain ownership of the content you create on DrawVault (form names, descriptions,
        branding). By using the Service you grant DrawVault a licence to host and display
        that content solely to provide the Service.
      </p>

      <h2>Advertising</h2>
      <p>
        Free-plan pages may display advertisements served by Google AdSense. These ads are
        provided by Google and are subject to{' '}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
          Google&apos;s advertising policies
        </a>.
        Upgrading to a paid plan removes all advertising from your account.
      </p>

      <h2>Termination</h2>
      <p>
        We reserve the right to suspend or terminate accounts that violate these terms, with
        or without notice. You may delete your account at any time.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not
        guarantee that the Service will be uninterrupted, error-free, or secure.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, DrawVault shall not be liable for any indirect,
        incidental, or consequential damages arising from your use of the Service.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Service after
        changes constitutes acceptance of the new terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Contact us at{' '}
        <a href="mailto:support@drawvault.site">support@drawvault.site</a>.
      </p>
    </article>
  )
}
