// app/payment/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoadingButton } from "@/components/loading-button";

export default function PaymentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });

  useEffect(() => {
    const fetchPaymentAmount = async () => {
      try {
        setLoading(true);

        // Fetch aptitude test payment settings
        const response = await fetch("/settings/group/payment", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch payment settings");
        }

        const settings = await response.json();
        const aptitudeTestSetting = settings.find(
          (s:any) => s.key === "payment.aptitude_test.amount"
        );

        if (aptitudeTestSetting) {
          setAmount(Number(aptitudeTestSetting.value));
        } else {
          // Default amount if setting not found
          setAmount(25);
        }
      } catch (error) {
        console.error("Error fetching payment amount:", error);
        toast({
          title: "Error",
          description: "Failed to load payment information. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentAmount();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Apply formatting for card number (groups of 4 digits)
    if (name === "cardNumber") {
      const formatted =
        value
          .replace(/\s/g, "")
          .match(/.{1,4}/g)
          ?.join(" ")
          .substr(0, 19) || "";

      setPaymentInfo((prev) => ({
        ...prev,
        [name]: formatted
      }));
      return;
    }

    // Apply formatting for expiry date (MM/YY)
    if (name === "expiryDate") {
      const cleaned = value.replace(/\D/g, "").substr(0, 4);
      if (cleaned.length > 2) {
        const formatted = `${cleaned.substr(0, 2)}/${cleaned.substr(2)}`;
        setPaymentInfo((prev) => ({
          ...prev,
          [name]: formatted
        }));
      } else {
        setPaymentInfo((prev) => ({
          ...prev,
          [name]: cleaned
        }));
      }
      return;
    }

    // Apply length limit for CVV
    if (name === "cvv") {
      const cleaned = value.replace(/\D/g, "").substr(0, 3);
      setPaymentInfo((prev) => ({
        ...prev,
        [name]: cleaned
      }));
      return;
    }

    // Default handler for other fields
    setPaymentInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Basic validation
    if (paymentInfo.cardNumber.replace(/\s/g, "").length !== 16) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid 16-digit card number.",
        variant: "destructive"
      });
      return false;
    }

    if (paymentInfo.expiryDate.length !== 5) {
      toast({
        title: "Invalid Expiry Date",
        description: "Please enter a valid expiry date in MM/YY format.",
        variant: "destructive"
      });
      return false;
    }

    if (paymentInfo.cvv.length !== 3) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid 3-digit CVV.",
        variant: "destructive"
      });
      return false;
    }

    if (!paymentInfo.cardholderName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter the cardholder name.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    try {
      setProcessing(true);

      // This would be replaced with your actual payment API endpoint
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          userId: user._id,
          amount: amount,
          paymentType: "aptitude_test",
          paymentMethod: "card",
          // In a real implementation, you'd never send full card details to your server
          // This is just for demonstration. Use a proper payment gateway instead.
          last4: paymentInfo.cardNumber.slice(-4)
        })
      });

      if (!paymentResponse.ok) {
        throw new Error("Payment processing failed");
      }

      // If payment successful, update user's payment status for aptitude test
      await fetch(`/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          "metadata.aptitudeTestPaid": true
        })
      });

      toast({
        title: "Payment Successful",
        description:
          "Your payment has been processed. You can now take the aptitude test."
      });

      // Redirect to aptitude test
      router.push("/aptitude-test");
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          "We couldn't process your payment. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Payment for Aptitude Test</CardTitle>
          <CardDescription>
            Complete your payment to access the aptitude test.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="text-center py-2 my-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentInfo.cardNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={paymentInfo.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  name="cvv"
                  placeholder="123"
                  value={paymentInfo.cvv}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                name="cardholderName"
                placeholder="John Doe"
                value={paymentInfo.cardholderName}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/aptitude-test")}
            >
              Cancel
            </Button>

            <LoadingButton type="submit" loading={processing}>
              Pay ${amount.toFixed(2)}
            </LoadingButton>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
