import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { PolicyPage } from "@/components/info/InfoParts";

// Text from https://packlegacy.com/privacy-policy/
export const metadata: Metadata = withSeo("/privacy-policy/", {
  alternates: { canonical: "/privacy-policy/" },
  title: "Privacy Policy | Pack Legacy",
  description: "How Pack Legacy collects, uses, shares and protects your information when you use our website and packaging services.",
});

const sections = [
  {
    id: "collect",
    title: "Information We Collect",
    body: (
      <>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li><strong>Contact Data:</strong> Name, email address, phone number, and physical shipping/billing addresses.</li>
          <li><strong>Business Data:</strong> Company name, job title, and industry type</li>
          <li><strong>Transaction Data:</strong> Details about products you order, order history, and payment information (processed securely via third-party processors).</li>
          <li><strong>Technical Data:</strong> IP address, browser type, and usage data collected automatically via cookies.</li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "How We Use Your Information",
    body: (
      <>
        <p>We use the collected data to:</p>
        <ul>
          <li>Process, fulfill, and ship your packaging orders.</li>
          <li>Communicate with you regarding orders, accounts, and customer service inquiries.</li>
          <li>Send promotional materials, newsletters, and updates (you can opt out at any time).</li>
          <li>Improve our website functionality, security, and user experience.</li>
        </ul>
        <p>We do not sell your personal data. We only share your information with:</p>
        <ul>
          <li><strong>Service Providers:</strong> Trusted third parties who assist us in operating our website, conducting our business, or servicing your orders (e.g., shipping carriers, payment gateways).</li>
          <li><strong>Legal Obligations:</strong> When required by law, regulation, or legal process to protect our rights and safety.</li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "Data Security",
    body: (
      <>
        <p>We take data protection seriously and implement robust, industry-standard administrative, physical, and technical controls to secure your corporate data.</p>
        <ul>
          <li><strong>Data Protection:</strong> We utilize Secure Sockets Layer (SSL/TLS) encryption to protect information transmitted through our website.</li>
          <li><strong>Proprietary Designs:</strong> Access to proprietary corporate packaging designs, artwork files, and account data is restricted strictly to authorized personnel who require it to fulfill your orders.</li>
          <li><strong>No Absolute Security:</strong> While we use commercially acceptable means to protect your information, please note that no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and Tracking Technologies",
    body: (
      <>
        <p>We use cookies, web beacons, and similar tracking technologies to enhance your experience on our website.</p>
        <ul>
          <li><strong>Essential Cookies:</strong> Necessary for the website to function, such as maintaining your session or secure login to your B2B account portal.</li>
          <li><strong>Performance Cookies:</strong> Help us analyze website traffic, user behavior, and visitor interactions with our pages so we can improve site functionality.</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences, such as your preferred language or region, to provide a personalized experience.</li>
        </ul>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "Legal Disclaimer",
    body: (
      <>
        <p>The content, materials, and information provided on the Pack Legacy website are for general informational purposes only and do not constitute professional manufacturing, structural engineering, or legal advice.</p>
        <ul>
          <li><strong>Website Accuracy:</strong> While we strive to maintain accurate and up-to-date website information, we make no representations or warranties of any kind regarding the completeness or reliability of the site’s content.</li>
          <li><strong>External Links:</strong> Our website may contain links to third-party websites or services that are not owned or controlled by Pack Legacy. We assume no responsibility or liability for the content, privacy policies, or practices of any third-party websites.</li>
        </ul>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your Rights and Choices",
    body: <p>Depending on your location, you may have the right to access, correct, or delete the personal information we hold about you. You can also disable cookies in your browser settings, though some website features may stop working properly.</p>,
  },
  {
    id: "updates",
    title: "Updates to This Policy",
    body: <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated “Effective Date.”</p>,
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      crumb="Privacy Policy"
      title={<>Privacy <em>Policy</em></>}
      lead="Pack Legacy (“we,” “our,” or “us”) values your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our packaging services."
      sections={sections}
    />
  );
}
