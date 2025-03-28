import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ResetPasswordForm } from "@/components/reset-password-form";
import bgImage from '../../../../public/images/bg.jpg';

// Define our own searchParams type instead of using PageProps
export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined } & { token?: string | string[] }
}) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : ""; 

  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Invalid reset link</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          This password reset link is invalid or has expired. Please request a
          new password reset link.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            K12 LMS
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
      <Image
        src={bgImage}
        alt="Background"
        className="hidden lg:block object-cover w-full h-full"
        priority
      />
    </div>
  );
}