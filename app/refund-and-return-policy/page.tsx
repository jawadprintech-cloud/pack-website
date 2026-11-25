import type { Metadata } from "next";
import { withSeo } from "@/lib/seo";
import { PolicyPage } from "@/components/info/InfoParts";

// Text from https://packlegacy.com/refund-and-return-policy/
export const metadata: Metadata = withSeo("/refund-and-return-policy/", {
  alternates: { canonical: "/refund-and-return-policy/" },
  title: "Refund And Return Policy | Pack Legacy",
  description: "How returns, reprints, refunds and order cancellations work for Pack Legacy custom packaging orders.",
});

const tiers = [
  { when: "Window 1 (Within 4 Hours):", what: "You may cancel your order within four (4) hours of proof approval for a full refund, provided manufacturing has not physically commenced.", cls: "ip-fee-0", fee: "Full refund" },
  { when: "Window 2 (Standard Processing / 5% Fee):", what: "If production prepress or material staging has begun, a 5% cancellation fee will be assessed to cover administrative and operational processing.", cls: "ip-fee-1", fee: "5% fee" },
  { when: "Window 3 (12 to 24 Hours / 50% Fee):", what: "Cancellation requests submitted between 12 and 24 hours after proof approval are subject to a 50% cancellation charge. This fee covers dedicated raw materials, allocated press time, and manufacturing labor that cannot be recovered.", cls: "ip-fee-2", fee: "50% fee" },
  { when: "After 24 Hours:", what: "Orders cannot be canceled or modified more than 24 hours after proof approval.", cls: "ip-fee-3", fee: "No cancellation" },
];

const sections = [
  {
    id: "inspection",
    title: "Inspection Window and Faulty Products",
    body: (
      <ul>
        <li><strong>3-Day Inspection Period:</strong> Any claims regarding defects, order discrepancies, or manufacturing variances must be submitted to Pack Legacy within three (3) business days of delivery.</li>
        <li><strong>Policy Limitation:</strong> Returns, reprints, or refunds are strictly limited to products that are fundamentally faulty or do not align with the final approved digital proof. Custom orders cannot be returned for reasons unrelated to manufacturing defects.</li>
      </ul>
    ),
  },
  {
    id: "our-errors",
    title: "Manufacturer-Side Defects",
    body: (
      <>
        <p>If a structural or printing error is determined to have occurred on our end, Pack Legacy accepts full responsibility under the following conditions:</p>
        <ul>
          <li><strong>Remedy:</strong> We will reprint or replace the affected portion or the entire order at no additional cost to you.</li>
          <li><strong>Sole Discretion:</strong> Pack Legacy reserves the right to make the final determination of the defect’s validity after inspecting the product.</li>
          <li><strong>Return of Defective Goods:</strong> To qualify for a free reprint, the client must ship the complete, unaltered order back to our facility within seven (7) business days of filing the claim. The client is responsible for all return shipping logistics and costs.</li>
          <li><strong>Expedited Claims:</strong> To accelerate your claim and minimize supply chain downtime, please provide clear digital photography or video documentation of the defects alongside your initial claim submission.</li>
        </ul>
      </>
    ),
  },
  {
    id: "client-errors",
    title: "Client-Side Errors and Partial Refunds",
    body: (
      <>
        <p>If an error is present in the final product but matches the client-approved proof (e.g., typos, wrong dimensions approved by the client, or artwork placement mistakes), the following terms apply:</p>
        <ul>
          <li><strong>Inventory Return:</strong> The client must return the complete order to our facility to be eligible for any financial resolution.</li>
          <li><strong>Deductions:</strong> If a partial refund is granted, Pack Legacy will deduct all incurred costs—including shipping, prepress setup, plate making, material consumption, printing time, and credit card processing fees—from the final refund amount.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cancellation",
    title: "Order Cancellation Policy",
    body: (
      <>
        <p>Production schedules are initiated immediately following your formal proof approval to ensure rapid delivery. If you must cancel an order, the following tiered penalties apply:</p>
        <div className="ip-tiers">
          {tiers.map((t) => (
            <div className="ip-tier" key={t.when}>
              <span className="ip-tier-when">{t.when}</span>
              <p>{t.what}</p>
              <span className={`ip-tier-fee ${t.cls}`}>{t.fee}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

export default function RefundPage() {
  return (
    <PolicyPage
      crumb="Refund And Return Policy"
      title={<>Refund And <em>Return Policy</em></>}
      lead="Because all products manufactured by Pack Legacy are custom-made to your exact commercial specifications, our return and refund guidelines are strictly governed by the terms below. We require all clients to thoroughly inspect their shipments immediately upon arrival."
      sections={sections}
    />
  );
}
