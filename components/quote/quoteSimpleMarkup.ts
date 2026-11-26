// Short quote form (name, email, phone) used on /for-ai-agents/.
// It keeps the class names and hidden artwork/hint elements that MagneticBoxesScript expects,
// so submission, errors and the thank-you redirect work exactly like the full form.
const quoteSimpleMarkup =
  "<section class=\"quote-panel quote-simple\" aria-labelledby=\"quote-title\"><div id=\"quote-title\" class=\"quote-title\">Fill Out The Quote Form</div>" +
  "<form action=\"/api/quote/\" method=\"post\" class=\"quote-form\" aria-busy=\"false\" encType=\"multipart/form-data\">" +
  "<div class=\"form-grid quote-contact\">" +
  "<label>Full Name *<input placeholder=\"Full Name\" required=\"\" minLength=\"2\" maxLength=\"120\" autoComplete=\"name\" name=\"name\"/></label>" +
  "<label>Email Address *<input type=\"email\" placeholder=\"Email Address\" maxLength=\"254\" autoComplete=\"email\" required=\"\" name=\"email\"/></label>" +
  "<label>Phone Number *<input type=\"tel\" placeholder=\"Phone Number\" minLength=\"7\" maxLength=\"40\" autoComplete=\"tel\" required=\"\" name=\"phone\"/></label>" +
  "</div>" +
  "<p class=\"design-hint\" hidden=\"\"></p>" +
  "<div hidden=\"\"><label class=\"file-label\"><span>Attach artwork<small></small></span><input type=\"file\" name=\"artwork\" aria-label=\"Attach artwork\" accept=\".pdf,.png,.jpg,.jpeg\"/></label></div>" +
  "<div class=\"honeypot\" aria-hidden=\"true\"><label>Leave blank<input tabindex=\"-1\" autoComplete=\"off\" name=\"website\"/></label></div>" +
  "<button class=\"button red submit\" type=\"submit\">Submit</button>" +
  "</form></section>";

export default quoteSimpleMarkup;
