import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { PolicyPage } from "@/components/info/InfoParts";

// Text from https://packlegacy.com/terms-and-conditions/
export const metadata: Metadata = withSeo("/terms-and-conditions/", {
  alternates: { canonical: "/terms-and-conditions/" },
  title: "Terms And Conditions | Pack Legacy",
  description: "The terms that apply when you use the Pack Legacy website and order custom packaging, including artwork, proofs, reprints and delivery.",
});

const sections = [
  {
    id: "copyrights",
    title: "Copyrights",
    body: <p>Copyright (c) 2025 Pack Legacy™.Pack legacy reserves all rights of the company. It is strictly not allowed to use, copy, or publish any kind of material, software, images, products, or any of the website’s content.</p>,
  },
  {
    id: "customer-content",
    title: "Customer Content",
    body: (
      <>
        <p>You are entirely responsible for how you use content alongside any images, graphics, text, or other materials you include. Just be sure that anything you add, like text, designs, trademarks, or copyrighted works, has the proper permissions if it belongs to a third party. By placing an order, you confirm that your Products do not infringe on anyone’s rights, including copyright, trademarks, or privacy, and that they would not contain anything defamatory. You also ensure that you have the necessary rights or approvals to use any third-party material. When you order from Pack legacy, you are giving us the go-ahead to produce your products just as you have designed them.</p>
        <p>These features should be taken into account when using Pack legacy.</p>
        <ul>
          <li>We cannot be held responsible for any content you come across that you might find objectionable, inappropriate, or disagreeable.</li>
          <li>Your password is the key to your account. Make sure only you have access to it, and be mindful of who can log in to your account.</li>
          <li>To process your request smoothly, we may need certain information, whether business-related or personal. Rest assured, we only ask for what is necessary and handle your data with care.</li>
          <li>We may securely store and, if legally required, disclose content to uphold legal obligations, enforce terms of service, address rights concerns, or ensure the safety of our users and the public.</li>
        </ul>
      </>
    ),
  },
  {
    id: "order-placement",
    title: "Order Placement",
    body: <p>In order to place an order with Pack legacy, simply submit your finalized request, whether it is in a hard copy or electronic file format, ensuring you are clear on the products, services, and print details you need. Once your order is confirmed, we swiftly move it to the press office for printing, and from there, no changes can be made. We are here to make sure everything is set before we start!</p>,
  },
  {
    id: "design-files",
    title: "Design Files",
    body: <p>We provide design files at 72 DPI (low resolution) by default, but if you need higher resolution files, just reach out to <a href="mailto:sales@packlegacy.com">sales@packlegacy.com</a>, and we will be happy to give you a quote.</p>,
  },
  {
    id: "customer-artwork",
    title: "Artwork Provided By Customer",
    body: <p>If you want to provide the artwork, please make sure that all artwork, designs, and images are submitted in CMYK format with a minimum resolution of 300 DPI. Keep in mind that we cannot be held responsible for any color variations when converting from RGB to CMYK, or for any images that appear blurry, distorted, or pixelated due to the quality of the provided artwork.</p>,
  },
  {
    id: "proofs",
    title: "Proof And Color Accuracy",
    body: <p>Before approving the final proof, it is important to carefully review it for any potential errors, such as layout issues, spacing, punctuation, image placement, and content. Since electronic proofs can not account for transparency, make sure everything looks correct in your original file. Also, note that the company is not responsible for printed items with lamination, and the client is fully accountable for the final proof. While we strive for color accuracy, keep in mind that due to the nature of the printing process, the printed color may vary from what is shown in the artwork, and color changes between the expected and final product are not guaranteed. We will do our best to match the shade as closely as possible, but it is important to be aware of this limitation.</p>,
  },
  {
    id: "cancellation",
    title: "Order Cancellation And Refunds",
    body: <p>Once an order is approved, it is considered final and can not be canceled or refunded, since production has already started and resources are committed. So, it is really important to double-check your design and order details before giving the green light to confirm everything is just right.</p>,
  },
  {
    id: "returns",
    title: "Returns And Reprints",
    body: <p>If you notice any printing issues or that your order does not match your requirements, please let us know within 3 working days of receiving it. If our team confirms the error is on our end, we will gladly reprint it, though refunds are not available. To help us assess the issue, kindly send digital photos of the defective product within seven days. To receive replacement products, you will need to return at least 99% of the original order within 10 days, at your own expense, and with prior written return authorization from Pack legacy. Please note that expedited order charges are non-refundable.</p>,
  },
  {
    id: "delivery",
    title: "Shipment And Delivery",
    body: <p>Once your full payment is received and your artwork is submitted, the printing turnaround time begins. While we strive to meet all delivery schedules, unforeseen delays due to weather, technical issues, customs, or shipping carriers are beyond our control. However, if a delay occurs on our end, such as equipment failure or technical malfunctions, we will issue a refund. At Pack legacy, customer satisfaction is our priority, and we are committed to delivering top-quality packaging at a fair price. If you have any questions about our terms, feel free to reach out!</p>,
  },
];

export default function TermsPage() {
  return (
    <PolicyPage
      crumb="Terms And Conditions"
      title={<>Terms And <em>Conditions</em></>}
      lead={
        <>
          Read these terms and conditions thoroughly before using this website. When you use this Site, you must agree to follow these Terms and Conditions, along with any additional guidelines, restrictions, or rules that may apply to specific sections or services. These extra guidelines are part of the Terms and Conditions, ensuring everything stays clear and consistent.
          <br /><br />
          <a className="ip-link" href="/">Pack Legacy</a> may update the Site and these Terms and Conditions from time to time without any notice. To stay informed, you must review the Terms of Use whenever you visit.
        </>
      }
      sections={sections}
    />
  );
}
