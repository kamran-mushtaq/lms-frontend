import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OtpVerificationForm } from "@/components/otp-verification-form";
import bgImage from '../../../../public/images/bg.jpg';

// Simplify the props type by using a more straightforward interface
interface VerifyOtpPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function VerifyOtpPage(props: any) {
  const searchParams = props.searchParams || {};
  const userId = typeof searchParams.userId === 'string' ? searchParams.userId : "";

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
          <div className="w-full max-w-md">
            <OtpVerificationForm userId={userId} />
          </div>
        </div>
      </div>
      <Image
        src={bgImage}
        alt="Background"
        className="hidden lg:block object-cover w-full h-full"
      />
    </div>
  );
}