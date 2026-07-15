import LegalPage, { LegalSection } from "../components/LegalPage";

export const metadata = {
  title: "Contact | Keyword Traffic",
  description: "Contact Keyword Traffic for support, privacy, data deletion, or Google Ads connection questions.",
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      updated="July 15, 2026"
      intro="Contact the Keyword Traffic team for account support, Google Ads connection questions, privacy requests, or data deletion."
    >
      <LegalSection title="Support email">
        <p>
          Email{" "}
          <a className="font-medium text-indigo-300 underline underline-offset-4 hover:text-indigo-200" href="mailto:seemreviews@gmail.com">
            seemreviews@gmail.com
          </a>
          .
        </p>
        <p>
          Please include the email address associated with your Keyword Traffic account and a clear description of the issue. Do not send passwords, OAuth client secrets, developer tokens, or other sensitive credentials by email.
        </p>
      </LegalSection>

      <LegalSection title="Privacy and Google data requests">
        <p>
          Use the same email address to request access to, correction of, or deletion of eligible account information, project data, and stored Google OAuth credentials. You may also revoke Keyword Traffic access directly from your Google Account permissions page.
        </p>
      </LegalSection>

      <LegalSection title="Service information">
        <p>
          Website: <span className="font-medium text-white">https://coupon-tech.com</span>
        </p>
        <p>
          Product: <span className="font-medium text-white">Keyword Traffic</span>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
