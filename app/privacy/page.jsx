import LegalPage, { LegalSection } from "../components/LegalPage";

export const metadata = {
  title: "Privacy Policy | Keyword Traffic",
  description: "How Keyword Traffic collects, uses, stores, and protects account, keyword, and Google Ads data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 15, 2026"
      intro="This Privacy Policy explains how Keyword Traffic handles information when authorized users create accounts, organize keyword projects, and connect Google Ads for keyword planning features."
    >
      <LegalSection title="1. Information we collect">
        <p>
          We may collect account information such as your name and email address, project names, keyword lists, uploaded files, generated exports, and basic technical logs used to operate and secure the service.
        </p>
        <p>
          When you choose to connect Google Ads, we may process the Google Ads customer and manager account identifiers you authorize, OAuth access and refresh credentials, keyword-planning requests, and the historical keyword metrics returned for your authorized account.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use information">
        <p>
          We use information to authenticate users, create and manage keyword research projects, normalize and remove duplicate keywords, request authorized Google Ads keyword-planning data, display results, generate exports, maintain security, troubleshoot errors, and improve user-facing features.
        </p>
        <p>
          Google user data is used only to provide or improve the visible Google Ads connection and keyword-planning features requested by the authorized user.
        </p>
      </LegalSection>

      <LegalSection title="3. Google API data and Limited Use">
        <p>
          Our use of information received from Google APIs follows the Google API Services User Data Policy, including its Limited Use requirements. We do not sell Google user data, use it for personalized advertising, or transfer it to data brokers or unrelated third parties.
        </p>
        <p>
          Keyword Traffic requests only the permissions needed for the Google Ads features presented in the product. Connecting Google Ads is voluntary and authorization can be revoked through your Google Account permissions.
        </p>
        <p>
          Review or revoke connected-app access at{" "}
          <a
            className="font-medium text-indigo-300 underline underline-offset-4 hover:text-indigo-200"
            href="https://myaccount.google.com/permissions"
            rel="noreferrer"
            target="_blank"
          >
            Google Account permissions
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Storage and security">
        <p>
          We use reasonable administrative and technical safeguards, including HTTPS in transit, access controls, and encrypted storage for sensitive Google OAuth credentials where they are retained. No online system can guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="5. Sharing and service providers">
        <p>
          We may use infrastructure and database providers to host and operate the service. They may process information only as needed to provide those services and subject to appropriate confidentiality and security obligations. We may also disclose information when required by law or to protect the security and integrity of the service.
        </p>
      </LegalSection>

      <LegalSection title="6. Retention and deletion">
        <p>
          We retain account, project, and integration information only for as long as needed to operate the service, meet legal obligations, resolve disputes, or protect the platform. Authorized users may request account deletion, deletion of stored Google credentials, or deletion of project data by contacting us.
        </p>
        <p>
          Files exported or downloaded by a user are controlled by that user after download and may need to be deleted separately from their own devices or storage systems.
        </p>
      </LegalSection>

      <LegalSection title="7. Your choices">
        <p>
          You may choose not to connect Google Ads, revoke Google authorization, request access to or correction of your account information, and request deletion of eligible stored data.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          We may update this Privacy Policy when our features or data practices change. The updated date shown above will be revised, and material changes will be communicated through the service when appropriate.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          For privacy questions, Google data requests, or account deletion, email{" "}
          <a className="font-medium text-indigo-300 underline underline-offset-4 hover:text-indigo-200" href="mailto:seemreviews@gmail.com">
            seemreviews@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
