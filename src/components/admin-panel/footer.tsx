import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="z-20 w-full">
      <div className="mx-4 md:mx-8 flex h-14 items-center justify-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-center">
          © {currentYear} {""}
          <Link
            href="https://www.i-o.digital/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            IO Digital
          </Link>
          . All rights reserved.
        </p>
      </div>
    </div>
  );
}
