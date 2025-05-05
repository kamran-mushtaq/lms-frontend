// This component displays fee setup and payment information
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentProfile } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface FinancialsTabProps {
    profile: StudentProfile | null;
}

export default function FinancialsTab({ profile }: FinancialsTabProps) {
    if (!profile) return null;

    return (
        <div className="space-y-6">
            {/* Fee Setup Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Fee Setup</CardTitle>
                    <CardDescription>Current semester fee structure</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Semester ID</h3>
                                <p className="font-medium">{profile.feeSetup?.semesterId}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Fee Group ID</h3>
                                <p className="font-medium">{profile.feeSetup?.feeGroupId}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Total Credit Hours</h3>
                                <p className="font-medium">{profile.feeSetup?.totalCreditHours}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Payment Schedule</h3>
                                <p className="font-medium">{profile.monthlyOrBi}</p>
                            </div>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fee Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profile.feeSetup?.fees?.map((fee, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{fee.type}</TableCell>
                                    <TableCell>{fee.amount}</TableCell>
                                    <TableCell>{fee.dueDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={fee.status === "Paid" ? "success" : "destructive"}>
                                            {fee.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Discounts & Other Setup */}
            <Card>
                <CardHeader>
                    <CardTitle>Discounts / Other Setup</CardTitle>
                    <CardDescription>Applicable discounts and special arrangements</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Percentage</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Valid From</TableHead>
                                <TableHead>Valid Until</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profile.discounts?.map((discount, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{discount.taxOtherId}</TableCell>
                                    <TableCell>{discount.percentage}%</TableCell>
                                    <TableCell>{discount.amount}</TableCell>
                                    <TableCell>{discount.startValidDate}</TableCell>
                                    <TableCell>{discount.endValidDate}</TableCell>
                                </TableRow>
                            ))}

                            {(!profile.discounts || profile.discounts.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                        No discounts applied
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}