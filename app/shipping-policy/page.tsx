import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { PolicyPage } from "@/components/info/InfoParts";

// Text from https://packlegacy.com/shipping-policy/
export const metadata: Metadata = withSeo("/shipping-policy/", {
  alternates: { canonical: "/shipping-policy/" },
  title: "Shipping Policy | Pack Legacy",
  description: "Production and shipping timelines, free shipping, rush orders and tracking for Pack Legacy custom packaging orders.",
});

const sections = [
  {
    id: "timelines",
    title: "Standard Production & Shipping Timelines",
    body: (
      <>
        <div className="ip-stats" aria-hidden="true">
          <div className="ip-stat"><b>8–10</b><span>business days production</span></div>
          <div className="ip-stat"><b>2–3</b><span>business days shipping</span></div>
          <div className="ip-stat ip-stat-hl"><b>10–12</b><span>business days in total</span></div>
        </div>
        <ul>
          <li><strong>Production Time:</strong> 8 to 10 business days.</li>
          <li><strong>Shipping Time:</strong> 2 to 3 business days.</li>
          <li><strong>Total Estimated Delivery:</strong> 10 to 12 business days from the date of final artwork approval.</li>
        </ul>
        <p><strong>Please note:</strong> Business days are Monday through Friday, excluding major manufacturing holidays. Production timelines begin only after we receive your formal digital artwork approval and payment clearance.</p>
      </>
    ),
  },
  {
    id: "free-shipping",
    title: "Free Shipping Offer",
    body: (
      <>
        <p>We are pleased to offer Free Standard Shipping on qualifying orders.</p>
        <ul>
          <li><strong>Eligibility:</strong> Free shipping applies automatically to all orders that meet our minimum order value at checkout.</li>
          <li><strong>Carrier Selection:</strong> Pack Legacy will select the most efficient standard shipping method via trusted express carriers, such as UPS, DHL, and FedEx.</li>
        </ul>
      </>
    ),
  },
  {
    id: "rush",
    title: "Rush Orders",
    body: (
      <>
        <p>If you have an urgent product launch or an inventory shortage, we offer an expedited production tier:</p>
        <ul>
          <li><strong>Rush Production Time:</strong> 6-8 business days.</li>
          <li><strong>Rush Shipping:</strong> Expedited shipping options are available at checkout to minimize transit time.</li>
          <li><strong>Fees:</strong> Rush processing is subject to additional production fees, which will be itemized on your formal commercial invoice. Please note that Free Shipping does not apply to expedited rush shipping methods.</li>
        </ul>
      </>
    ),
  },
  {
    id: "tracking",
    title: "Tracking Information",
    body: (
      <>
        <p>We believe in full transparency throughout the fulfillment process.</p>
        <ul>
          <li><strong>Notification:</strong> As soon as your packaging order passes final quality control and is labeled at our loading dock, an automated email will be sent to your primary purchasing contact.</li>
          <li><strong>Details Provided:</strong> This email will include your tracking number and a link to the carrier’s portal (UPS, FedEx, or DHL) to monitor your shipment in real time.</li>
        </ul>
      </>
    ),
  },
  {
    id: "restrictions",
    title: "Shipping Time, Locations & Restrictions",
    body: (
      <ul>
        <li><strong>Shipping Time:</strong> Shipping times may vary based on your location, carrier, and order size. Some arrive quickly, while others may take a few extra days, depending on their details.</li>
        <li><strong>Dock Delivery:</strong> Customers must specify if their delivery location requires a liftgate or has a dedicated loading dock.</li>
        <li><strong>Delays:</strong> Pack Legacy is not liable for logistics delays caused by severe weather, carrier capacity constraints, or customs clearance for international border crossings.</li>
      </ul>
    ),
  },
];

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      crumb="Shipping Policy"
      title={<>Shipping <em>Policy</em></>}
      lead="At Pack Legacy, we understand that reliable timelines are critical to your supply chain. Because our commercial packaging products are made to order, your delivery timeline consists of two parts: Production Time and Shipping Time."
      sections={sections}
    />
  );
}
