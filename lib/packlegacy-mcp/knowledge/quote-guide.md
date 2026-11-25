# Submitting a packaging enquiry

Pack Legacy's initial quote form requires **only the customer's name, email address and phone number**. Every packaging detail is optional. The sales agent handles further questions, pricing, design discussion and follow-up.

Use `submit_quote_request` when the customer asks to submit an enquiry or asks Pack Legacy to contact them and has supplied those three contact fields. Reuse contact details already provided for that purpose. Do not ask the customer to fill the website form again or answer packaging questions before submitting. If they have already explicitly asked to send the enquiry, do not introduce another mandatory confirmation prompt.

## Confirmed ordering and enquiry rules

{{ordering_rules_summary}}

These rules come from the shared owner-confirmed policy. Product-specific choices and shipping arrangements can be discussed with the sales agent after the initial enquiry.

## Required contact information

| Field | Requirement |
| --- | --- |
| Name | Required. Use the customer's supplied name. |
| Email | Required. Use the customer's supplied email address. |
| Phone | Required. Use the customer's supplied telephone number. |

Ask only for a missing required contact field. Do not invent contact information or infer permission to contact somebody merely because their details appear in a document or unrelated conversation.

A product choice, quantity, dimensions, material, finish, artwork file, destination and requested delivery date are **not required** to submit an initial enquiry. A single custom box is allowed. An undecided quantity remains omitted or unknown; never fill it with 1, 50 or another assumed value.

## Include optional information already supplied

If the customer has mentioned a product, box style, dimensions, quantity, printing, finish, insert, destination or desired delivery date, include that information in the same enquiry. Preserve partial or uncertain requirements. Requested options and dates remain requests for the sales agent to discuss, not manufacturing approval or a delivery promise.

Product search and `prepare_quote_brief` may help a customer explore or organize requirements. They are optional helpers. Neither a catalogue lookup nor a prepared brief is a prerequisite for `submit_quote_request`.

If the optional draft lists information that will matter for an eventual offer, do not treat that list as a reason to delay a contact-only enquiry. The sales agent can collect it afterward.

## Free design support and optional artwork

Free design support uses the same quote enquiry. Record the customer's design request in the enquiry, including references, desired colours or logo requirements when provided. A customer may ask for design help without an artwork file or complete box specifications.

The submission adapter can forward an optional PDF, PNG or JPEG file through the existing website quote endpoint. The MCP submission limit is **2 MiB per file**, within a **3 MiB JSON transport limit**. The inspected product website form allows files up to **4 MiB**; that is a different transport limit. For a file above the MCP limit, use the website's supported upload route or arrange file sharing with the sales agent. Do not claim that a file was attached when it was not.

The existing `inspect_artwork_file` tool can inspect supported PDF, PNG and JPEG properties. Inspection is optional and is not a prerequisite for contacting sales. Neither successful inspection nor forwarding a file approves artwork for printing.

## Submission and response

The tool sends the supplied contact details and any optional enquiry information to the operator-configured Pack Legacy quote endpoint. It reports the website's acceptance response and an optional reference only when the backend supplies one. The customer does not need a reference number or account to begin an enquiry.

Do not claim that an email was delivered, a CRM record was saved, a price was approved or an order was placed unless that event is separately established. Website acceptance is the boundary reported by this adapter.

The tool does not automatically repeat a POST after a network or response failure. An optional technical `submission_id` is sent as the form's `id`; it is not a question to ask the customer, and backend duplicate handling remains unverified. If a request's outcome is unknown, explain that uncertainty and avoid promising a successful submission or silently creating another attempt.

If submission is unavailable, return the [quote form]({{quote_url}}) or Pack Legacy's contact route with the customer's known requirements. A link alone is not evidence that anything was submitted.

## Source and maintenance notes

The owner confirmed the contact-only required fields and sales-led follow-up workflow on 18 November 2026. The current public quote page and magnetic-closure product form were inspected with GET requests only on the same date. Both require name, email and phone; the product form also exposes optional design choices and artwork.

No live quote was submitted during that read-only inspection. The actual website's email delivery, persistence and backend duplicate handling were not verified. After editing this Markdown file, regenerate the bundled guide and run the guide consistency check.
