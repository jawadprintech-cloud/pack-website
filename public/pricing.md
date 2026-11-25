# Pack Legacy — Pricing and Quote Information

Updated: 2026-11-18
Document version: 1.2.0
Status: Draft for local and preview testing; not a published price offer.
Preview website: https://packlegacy-website.vercel.app/
Pricing model: Custom quote required.

> Pack Legacy's initial quote form requires only the customer's name, email address and phone number. Packaging specifications, quantity, artwork and design instructions are optional. The sales agent handles further questions, pricing and design follow-up. A single custom box can be made and shipped.

## 1. What a starting price means

A starting price is an indicative display figure. It is not a confirmed price for every size, material, print option or order quantity. Different products may display the same starting price.

The starting price does not establish the cost of a one-box order. It also does not establish an order total, shipping charge, tax amount or delivery date. An approved Pack Legacy offer is required before purchase.

Until a quote is approved:

- Final unit price: not confirmed.
- Final order total: not confirmed.
- Shipping and tax treatment for the requested order: to be confirmed.
- Price validity and payment terms: to be confirmed in the offer.

## 2. Starting prices observed on the preview website

These references were checked on 2026-11-18. They describe the preview's displayed content and are not an approved price list.

| Preview source | Displayed starting figure | What is established |
| --- | --- | --- |
| [Homepage](https://packlegacy-website.vercel.app/), format cards for magnetic closure, kraft, pillow and die-cut boxes | $2.00 each | A starting display figure. The cards do not identify the quantity and complete specifications that qualify for it. |
| [Magnetic closure boxes](https://packlegacy-website.vercel.app/product/magnetic-closure-boxes/) | $2.05, shown as an estimated starting figure; the page's structured data identifies USD | An estimated starting figure for this page. The quantity and configuration to which it applies are not established. |

The homepage and magnetic-closure product page display different figures. Neither figure is selected here as a payable rate. This draft contains no approved numeric quantity-price table.

An assistant can describe these figures as website starting estimates with their source and date. It should obtain a custom quote to answer “What will my order cost?” Multiplying either figure by the requested quantity does not produce a confirmed quote.

## 3. Quantities and the one-box policy

| Situation | Pricing and enquiry rule |
| --- | --- |
| One custom box | A single custom box can be made and shipped. Its price and shipping arrangements require a quote. |
| Multiple custom boxes | Request the actual quantity needed. There is no confirmed numerical discount schedule in this document. |
| Quantity not yet decided | An initial enquiry is allowed. Keep the quantity unknown until the customer supplies it. |
| Preparing a final offer | Confirm the exact quantity and specifications before establishing a payable price. |
| Paper bags and other non-box products | Confirm the product's own minimum and pricing with Pack Legacy. The one-box policy does not establish their minimum quantities. |

The quantity choices displayed on the preview website do not override the confirmed one-custom-box policy. An assistant must not silently replace an unknown quantity with 1, 50, 100 or another number.

The preview's existing `llms.txt` includes a separate paper-bag minimum. This draft does not approve or revise that non-box rule. Confirm it before giving a customer a purchasing commitment.

## 4. Starting an enquiry

The owner confirmed on 2026-11-18 that the initial quote form requires only:

| Required contact field | What to provide |
| --- | --- |
| Name | The customer's name. |
| Email | The customer's email address. |
| Phone | The customer's telephone number. |

The current [quote page](https://packlegacy-website.vercel.app/get-a-quote/) and [magnetic-closure product form](https://packlegacy-website.vercel.app/product/magnetic-closure-boxes/) match these three required fields. The customer can submit with those details alone. Product selection, quantity, dimensions, material, printing, finish, design request and artwork are optional.

The following information can help the sales agent when the customer already knows it:

| Detail | What the customer can provide |
| --- | --- |
| Packaging | Product link, preferred box style or what needs to be packed. |
| Dimensions | Length, width and height, units, and whether these are internal box, external box or product measurements. |
| Quantity | Desired quantity, or leave it undecided for the initial enquiry. |
| Material | Preferred material and thickness, if known, or a request for advice. |
| Printing | Inside, outside or both; colours and artwork requirements, if known. |
| Finishes and inserts | Requested coatings, foil, embossing, windows, compartments or inserts. These requests need feasibility and price confirmation. |
| Artwork | Artwork available, artwork in progress, design help needed or undecided. |
| Destination and timing | Delivery country and postcode, plus a desired arrival date if there is one. |

Include optional details the customer has already supplied; do not ask them to complete this table before submitting. The sales agent handles missing information afterward. Requested features and dates are subject to confirmation for the specific order.

## 5. Design support, delivery and other costs

The preview [homepage](https://packlegacy-website.vercel.app/) and [quote page](https://packlegacy-website.vercel.app/get-a-quote/) advertise free design support. The owner confirmed that design requests and optional artwork use the same quote enquiry; a separate design-service application is not required. The sales agent handles the design discussion afterward. The quote page also advertises no die or plate charges. Confirm the requested design scope and the items included in the final offer.

Shipping promotions appear on the preview website, but the reviewed MCP business rules do not establish their destination coverage, exclusions or order-specific application. The ability to ship one custom box does not by itself establish free shipping. Confirm shipping treatment for the customer's destination and order.

Sample charges, optional services, taxes, any applicable duties, production timing and transit timing require confirmation where relevant. A missing charge is unknown, not automatically zero. No delivery date is guaranteed by this document.

## 6. Getting a confirmed price

1. Submit the customer's name, email and phone. Include any packaging details, design request or artwork the customer chooses to provide.
2. Let the Pack Legacy sales agent follow up and clarify the requirement, including quantity and specifications when needed for pricing.
3. Receive the quotation and design guidance through the sales agent's normal process.
4. Agree the order-specific price, inclusions, shipping, taxes, timing and payment arrangements with that agent before placing the order.

Preview enquiry page: https://packlegacy-website.vercel.app/get-a-quote/

Public email listed on the preview website: sales@packlegacy.com

The preview enquiry page is a development link. Public frontend inspection established its field names and submission route; it did not verify email delivery or persistent storage. A backend acceptance response alone does not establish that sales follow-up has occurred.

## 7. Information for connected AI assistants

- Use `submit_quote_request` when the customer asks to submit an enquiry or asks Pack Legacy to contact them and has provided name, email and phone.
- Reuse the supplied contact details. Ask only for a missing required contact field; do not require packaging specifications or another confirmation when the customer has already explicitly asked to send the enquiry.
- Include optional information already provided. Keep an unknown quantity unknown and preserve the confirmed one-custom-box policy within its scope.
- Include design help in the same enquiry. An artwork file remains optional, including when the customer intends to share it later.
- Product search, artwork inspection and `prepare_quote_brief` are optional helpers; none is a prerequisite for initial submission.
- Report the actual website acceptance result. A reference is optional and may be returned only if supplied by the backend. Do not invent email delivery, CRM storage or sales follow-up.
- Explain published starting prices with their source and date. Final pricing, design work and further questions are handled by the sales agent.
- Do not invent quantity discounts, use another business's prices, multiply a starting figure into a payable total, or infer missing shipping and tax amounts.
- Reading this document does not authorize sending a person's contact details or placing an order. The customer's request to submit or be contacted supplies the relevant enquiry intent.

`prepare_quote_brief` remains an unsent, unsaved helper. The new `submit_quote_request` adapter sends the enquiry to the existing operator-configured quote endpoint. It forwards an optional supported artwork file within its 2 MiB file and 3 MiB JSON transport limits; the inspected product website form has a separate 4 MiB upload limit. Successful file inspection or forwarding is not print approval.

No quote-status, approved-price retrieval, payment, order-management or proof-approval tool is included in this sales-led enquiry workflow.

## 8. Sources and scope

The one-custom-box and optional initial quantity rules were owner-confirmed on 2026-11-17. On 2026-11-18, the owner clarified that only name, email and phone are required, every other initial-enquiry field is optional, and the sales agent handles subsequent pricing, design and follow-up. The maintained rules are in `lib/packlegacy-mcp/knowledge/business-rules.json`.

Preview website references checked on 2026-11-18:

- [Pack Legacy homepage](https://packlegacy-website.vercel.app/)
- [Magnetic closure product page](https://packlegacy-website.vercel.app/product/magnetic-closure-boxes/)
- [Get a quote](https://packlegacy-website.vercel.app/get-a-quote/)
- [Existing llms.txt](https://packlegacy-website.vercel.app/llms.txt)

This document is bundled with Pack Legacy MCP v0.5.0 and is available through its pricing tool and resource. The local harness also serves it at /pricing.md. It has not been published to the Pack Legacy preview or production website by this package.
