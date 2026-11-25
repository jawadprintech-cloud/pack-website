// Pack Legacy's public review profiles. Every Clutch / Bark / Trustpilot logo on the site links here.
export const REVIEW_PROFILES = {
  clutch: "https://clutch.co/profile/pack-legacy/",
  bark: "https://www.bark.com/en/us/company/pack-legacy/DjKXZm/",
  trustpilot: "https://www.trustpilot.com/review/packlegacy.com",
} as const;

export type ReviewSite = keyof typeof REVIEW_PROFILES;

/** Attributes for a link that opens a review profile in a new tab. */
export const reviewLinkProps = (site: ReviewSite) => ({
  href: REVIEW_PROFILES[site],
  target: "_blank",
  rel: "noopener noreferrer",
});
