"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardRecent() {
  return (
    <Card className="dark:bg-background/40 shadow-none">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent className="">
        <ScrollArea className="h-[310px] w-full pr-5">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Olivia Martin</p>
            </div>
            <div className="ml-auto font-medium">+$1,999.00</div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src="/avatars/02.png" alt="Avatar" />
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Jackson Lee</p>
            </div>
            <div className="ml-auto font-medium">+$39.00</div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src="/avatars/03.png" alt="Avatar" />
              <AvatarFallback>IN</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                Isabella Nguyen
              </p>
            </div>
            <div className="ml-auto font-medium">+$299.00</div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src="/avatars/04.png" alt="Avatar" />
              <AvatarFallback>WK</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">William Kim</p>
            </div>
            <div className="ml-auto font-medium">+$99.00</div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src="/avatars/05.png" alt="Avatar" />
              <AvatarFallback>SD</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Sofia Davis</p>
            </div>
            <div className="ml-auto font-medium">+$39.00</div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Olivia Martin</p>
            </div>
            <div className="ml-auto font-medium">+$1,999.00</div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src="/avatars/02.png" alt="Avatar" />
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Jackson Lee</p>
            </div>
            <div className="ml-auto font-medium">+$39.00</div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
