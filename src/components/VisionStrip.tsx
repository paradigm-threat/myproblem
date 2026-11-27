import Link from "next/link";

type Props = {
  className?: string;
};

/** CleverTree Relay Vision — SI as a free public utility. */
export function VisionStrip({ className }: Props) {
  return (
    <section
      className={className ? `vision-strip ${className}` : "vision-strip"}
      aria-labelledby="vision-strip-heading"
    >
      <div className="site vision-strip-inner">
        <p className="eyebrow">CleverTree Relay Vision</p>
        <h2 id="vision-strip-heading">
          Intelligence should be a free public utility.
        </h2>
        <p>
          Public help and public-channel SI stay free. Private services fund
          privacy, infrastructure, and model usage—not a paywall on intelligence
          itself.
        </p>
        <p>
          <Link href="/how-we-run">How we run</Link>
          {" · "}
          <Link href="/#simple-max">Simple Max</Link>
        </p>
      </div>
    </section>
  );
}
