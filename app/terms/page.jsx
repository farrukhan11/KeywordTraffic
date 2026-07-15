import LegalPage, { LegalSection } from "../components/LegalPage";

export const metadata = {
  title: "Terms of Service | Keyword Traffic",
  description: "Terms governing use of the Keyword Traffic keyword research and campaign-planning platform.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 15, 2026"
      intro="These Terms govern access to and use of Keyword Traffic, an internal keyword research and Google Ads campaign-planning platform."
    >
      <LegalSection title="1. Acceptance of these Terms">
        <p>
          By creating an account, accessing the dashboard, or using Keyword Traffic, you agree to these Terms and the Privacy Policy. Do not use the service if you do not agree.
        </p>
      </LegalSection>

      <LegalSection title="2. Authorized use">
        <p>
          Keyword Traffic is intended for authorized business users who organize keyword projects, process bulk keyword lists, and retrieve permitted keyword-planning information for advertising research and campaign planning.
        </p>
        <p>
          You are responsible for ensuring that your use of the service, uploaded keywords, connected accounts, and exported data complies with applicable laws, Google policies, advertising-platform rules, and any contractual obligations that apply to you.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts and security">
        <p>
          You must provide accurate account information, keep login credentials confidential, and promptly notify us if you suspect unauthorized access. You are responsible for activity performed through your account unless caused by our failure to use reasonable security measures.
        </p>
      </LegalSection>

      <LegalSection title="4. Google Ads connection">
        <p>
          Google Ads access is optional and requires authorization through Google OAuth. You may only connect accounts that you are authorized to access. Keyword Traffic will use the authorization only for the user-facing features described in the product and Privacy Policy.
        </p>
        <p>
          Google may change API availability, quotas, policies, or returned data. We do not control Google services and cannot guarantee uninterrupted access to Google Ads features.
        </p>
      </LegalSection>

      <LegalSection title="5. Prohibited conduct">
        <p>You must not:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Use the service for unlawful, deceptive, fraudulent, or abusive activity.</li>
          <li>Access or connect an account without permission.</li>
          <li>Attempt to bypass access controls, rate limits, or security protections.</li>
          <li>Upload malware or interfere with the operation of the service.</li>
          <li>Resell, disclose, or distribute Google user data in a way prohibited by Google policy.</li>
          <li>Misrepresent sample, estimated, or historical metrics as guaranteed results.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Keyword metrics and outputs">
        <p>
          Search volumes, competition indicators, bid ranges, and related metrics may be historical, estimated, rounded, delayed, incomplete, or affected by account and location settings. They are provided for planning purposes and do not guarantee traffic, rankings, conversions, or advertising performance.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          Keyword Traffic and its original software, interface, and content are protected by applicable intellectual-property laws. You retain ownership of your submitted keyword lists and project content, subject to the permissions needed for us to process them and provide the service.
        </p>
      </LegalSection>

      <LegalSection title="8. Suspension and termination">
        <p>
          We may restrict or terminate access when reasonably necessary to protect the service, investigate abuse, comply with law or platform policy, or address a material violation of these Terms. You may stop using the service and request account deletion at any time.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimers and limitation">
        <p>
          The service is provided on an as-available basis. To the extent permitted by law, we disclaim implied warranties and are not responsible for indirect, incidental, special, or consequential losses arising from use of the service, third-party platforms, or reliance on keyword metrics.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to these Terms">
        <p>
          We may update these Terms to reflect product, legal, security, or policy changes. Continued use after updated Terms become effective means you accept the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions about these Terms can be sent to{" "}
          <a className="font-medium text-indigo-300 underline underline-offset-4 hover:text-indigo-200" href="mailto:seemreviews@gmail.com">
            seemreviews@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
