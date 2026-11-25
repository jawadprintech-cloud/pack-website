// Instagram photo strip used on the homepage and Custom Boxes page.
// Photos are sharp and scroll slowly from right to left. Hovering pauses the strip and shows a soft blur,
// a green tint and the Instagram logo with "View on Instagram" over that photo.
// The list is drawn twice so the loop is seamless; the copy is hidden from screen readers and keyboard.
// Styles: styles/insta-marquee.css (loaded in app/layout.tsx).
const INSTAGRAM = "https://www.instagram.com/pack_legacy/";

export default function InstaMarquee({ images }: { images: string[] }) {
  // Repeat short lists so one copy is always wider than the screen.
  const set = images.length < 8 ? [...images, ...images] : images;
  return (
    <div className="insta-marquee" style={{ "--insta-count": set.length } as React.CSSProperties}>
      <div className="insta-track">
        {[0, 1].map((copy) => (
          <ul className="insta-set" key={copy} aria-hidden={copy === 1 || undefined}>
            {set.map((src, i) => (
              <li key={`${src}-${i}`}>
                <a href={INSTAGRAM} rel="nofollow" aria-label="View on Instagram" tabIndex={copy === 1 ? -1 : undefined}>
                  <img src={src} alt="" width={400} height={400} loading="lazy" />
                  <span className="insta-hover" aria-hidden="true">
                    <span className="insta-logo">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                        <circle cx="12" cy="12" r="4.2" />
                        <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
                      </svg>
                    </span>
                    <span className="insta-label">View on Instagram</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
