// "Follow Packlegacy on Instagram" strip on the homepage and About Us. Outside the homepage, wrap it in <div className="plh">.
import InstaMarquee from "@/components/InstaMarquee";
import "@/styles/home.css";

const instagram = ["/cat-cbd.webp", "/cat-rigid.webp", "/cat-magnetic.webp", "/cat-gift.webp", "/cat-cosmetic.webp"];

export default function InstagramSection() {
  return (
    <section className="h-insta" aria-labelledby="h-insta-title">
      <div className="h-insta-head">
        <p id="h-insta-title">
          Follow <a href="https://www.instagram.com/pack_legacy/" rel="nofollow">Packlegacy</a> on Instagram for ideas and
          inspiration to make your custom packaging look amazing.
        </p>
        <div className="h-social">
          <a href="https://www.instagram.com/pack_legacy/" rel="nofollow" aria-label="Instagram">
            <i className="fab fa-instagram" aria-hidden="true"></i>
          </a>
        </div>
      </div>
      <InstaMarquee images={instagram.map((img) => img)} />
    </section>
  );
}
