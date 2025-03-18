import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";

import { BgImg } from "../../../public/images";
import { ConfirmPasswordForm } from "@/components/confirm-password-form";

export default function ConfimPasswordPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start hidden">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ConfirmPasswordForm />
          </div>
        </div>
      </div>
      <Image src={BgImg} alt="Image" className="object-cover w-full h-full" />
    </div>
  );
}
