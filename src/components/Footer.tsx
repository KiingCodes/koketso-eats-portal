import footerLogo from "@/assets/footer-jeweliq.png";

export default function Footer() {
  return (
    <footer className="border-t bg-background py-6">
      <div className="container mx-auto flex flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground sm:flex-row">
        <span>Designed &amp; managed by</span>
        <img
          src={footerLogo}
          alt="JewelIQ"
          className="h-10 w-auto max-w-[180px] object-contain"
          loading="lazy"
        />
      </div>
    </footer>
  );
}