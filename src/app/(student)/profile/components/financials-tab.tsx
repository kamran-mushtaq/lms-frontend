// src/app/(student)/profile/components/financials-tab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentProfile } from "../types";
import { CreditCard, Receipt, Percent } from "lucide-react";

interface FinancialsTabProps {
    profile: StudentProfile | null;
}

export default function FinancialsTab({ profile }: FinancialsTabProps) {
    if (!profile) return null;

    return (
        <div className="space-y-8">
            {/* Fee Summary Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Fee Setup
                    </CardTitle>
                    <CardDescription>
                        Current semester fee structure and payment details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Semester ID</p>
                            <p className="font-medium">{profile.feeSetup?.semesterId || "N/A"}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Fee Group ID</p>
                            <p className="font-medium">{profile.feeSetup?.feeGroupId || "N/A"}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Credit Hours</p>
                            <p className="font-medium">{profile.feeSetup?.totalCreditHours || "N/A"}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Payment Schedule</p>
                            <p className="font-medium">{profile.monthlyOrBi || "N/A"}</p>
                        </div>
                    </div>

                    {/* Fees and Payments Table */}
                    {profile.feeSetup?.fees && profile.feeSetup.fees.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fee Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {profile.feeSetup.fees.map((fee, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{fee.type}</TableCell>
                                            <TableCell>{fee.amount}</TableCell>
                                            <TableCell>{fee.dueDate}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={fee.status === "Paid" ? "success" : "destructive"}>
                                                    {fee.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Receipt className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No fee details</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No fee information is available for this semester.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Discounts Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Percent className="h-5 w-5 text-primary" />
                        Discounts / Special Arrangements
                    </CardTitle>
                    <CardDescription>
                        Applicable discounts and special fee arrangements
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {profile.discounts && profile.discounts.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Percentage</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="hidden md:table-cell">Valid From</TableHead>
                                        <TableHead className="hidden md:table-cell">Valid Until</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {profile.discounts.map((discount, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{discount.type}</TableCell>
                                            <TableCell>{discount.percentage}%</TableCell>
                                            <TableCell>{discount.amount}</TableCell>
                                            <TableCell className="hidden md:table-cell">{discount.startValidDate}</TableCell>
                                            <TableCell className="hidden md:table-cell">{discount.endValidDate}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Percent className="h-10 w-10 text-muted-foreground mb-2" />
                            <h4 className="text-base font-medium text-muted-foreground">No discounts applied</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                No discount or special fee arrangements are currently applied.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}