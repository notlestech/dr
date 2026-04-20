import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'DrawVault Privacy Policy — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground text-sm">Last updated: April 2026</p>

      <p>
        DrawVault (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website{' '}
        <a href="https://drawvault.site">drawvault.site</a>. This page explains how we collect,
        use, and protect information when you use our service.
      </p>

      <h2>Information We Collect</h2>
      <h3>Account Information</h3>
      <p>
        When you create an account we collect your email address and, optionally, your name.
        This information is used solely to authenticate you and provide the service.
      </p>

      <h3>Form Entry Data</h3>
      <p>
        When participants submit entries to your giveaway forms, we store the data they enter
        (e.g., name, email) in our database. As the form owner you control what fields you
        collect. We do not sell or share this data with third parties.
      </p>

      <h3>Usage Data</h3>
      <p>
        We collect anonymised data about how our service is used — pages visited, features
        clicked, browser type — to improve the product. This data does not identify individual
        users.
      </p>

      <h3>Cookies</h3>
      <p>
        We use strictly necessary cookies for authentication and session management. We also
        use third-party advertising cookies (Google AdSense) on free-plan pages to display
        relevant advertisements. You can opt out of personalised ads via{' '}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          Google Ad Settings
        </a>.
      </p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To provide, maintain, and improve DrawVault</li>
        <li>To send transactional emails (e.g., email confirmation for entries)</li>
        <li>To process payments securely via Stripe</li>
        <li>To display advertising via Google AdSense on free-plan pages</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>Data Sharing</h2>
      <p>
        We do not sell your personal data. We share data only with service providers that
        help us operate DrawVault:
      </p>
      <ul>
        <li><strong>Supabase</strong> — database and authentication</li>
        <li><strong>Stripe</strong> — payment processing</li>
        <li><strong>Google</strong> — advertising (AdSense) and analytics</li>
        <li><strong>Cloudflare</strong> — bot protection (Turnstile)</li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        We retain your account data for as long as your account is active. You may delete
        your account and associated data at any time by contacting us. Form entry data is
        deleted when you delete the form.
      </p>

      <h2>Your Rights</h2>
      <p>
        Depending on your location you may have the right to access, correct, or delete your
        personal data, and to object to certain processing. To exercise these rights, contact
        us at <a href="mailto:support@drawvault.site">support@drawvault.site</a>.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        DrawVault is not directed at children under the age of 13. We do not knowingly collect
        personal information from children under 13.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify users of significant
        changes by posting a notice on the site. Continued use of the service after changes
        constitutes acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Reach us at{' '}
        <a href="mailto:support@drawvault.site">support@drawvault.site</a>.
      </p>
    </article>
  )
}
