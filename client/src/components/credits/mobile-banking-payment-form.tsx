import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PaymentMethod = "bkash" | "nagad" | "rocket" | "upay" | "bank-transfer" | "cash" | "other";

const mobilePaymentSchema = z.object({
  transactionId: z.string().min(5, {
    message: "ট্রানজেকশন আইডি কমপক্ষে ৫ অক্ষরের হতে হবে",
  }),
  paymentNumber: z.string().min(11, {
    message: "মোবাইল নম্বর কমপক্ষে ১১ সংখ্যার হতে হবে",
  }),
  notes: z.string().optional(),
});

type MobilePaymentFormValues = z.infer<typeof mobilePaymentSchema>;

interface MobilePaymentFormProps {
  onSubmit: (data: MobilePaymentFormValues) => void;
  amount: number;
  paymentMethod: PaymentMethod;
  isLoading?: boolean;
}

export function MobileBankingPaymentForm({
  onSubmit,
  amount,
  paymentMethod,
  isLoading = false,
}: MobilePaymentFormProps) {
  const form = useForm<MobilePaymentFormValues>({
    resolver: zodResolver(mobilePaymentSchema),
    defaultValues: {
      transactionId: "",
      paymentNumber: "",
      notes: "",
    },
  });

  // Payment method details
  const paymentMethods = {
    bkash: {
      name: "বিকাশ",
      number: "01712345678",
      type: "পারসোনাল",
      instructions: "বিকাশ অ্যাপ থেকে সেন্ড মানি অপশন সিলেক্ট করে উপরের নাম্বারে টাকা পাঠান।",
    },
    nagad: {
      name: "নগদ",
      number: "01712345678",
      type: "পারসোনাল",
      instructions: "নগদ অ্যাপ থেকে সেন্ড মানি অপশন সিলেক্ট করে উপরের নাম্বারে টাকা পাঠান।",
    },
    rocket: {
      name: "রকেট",
      number: "01712345678",
      type: "পারসোনাল",
      instructions: "রকেট অ্যাপ থেকে সেন্ড মানি অপশন সিলেক্ট করে উপরের নাম্বারে টাকা পাঠান।",
    },
    upay: {
      name: "উপায়",
      number: "01712345678",
      type: "পারসোনাল",
      instructions: "উপায় অ্যাপ থেকে সেন্ড মানি অপশন সিলেক্ট করে উপরের নাম্বারে টাকা পাঠান।",
    },
    "bank-transfer": {
      name: "ব্যাংক ট্রান্সফার",
      number: "1234567890",
      type: "ডাচ বাংলা ব্যাংক",
      instructions: "আপনার ব্যাংক অ্যাপ বা ব্যাংক ব্রাঞ্চ থেকে উপরের অ্যাকাউন্ট নাম্বারে টাকা পাঠান।",
    },
    cash: {
      name: "ক্যাশ",
      number: "",
      type: "",
      instructions: "আমাদের অফিসে এসে সরাসরি টাকা প্রদান করুন।",
    },
    other: {
      name: "অন্যান্য",
      number: "",
      type: "",
      instructions: "অন্যান্য পেমেন্ট মেথডের জন্য আমাদের সাথে যোগাযোগ করুন।",
    },
  };

  const methodDetails = paymentMethods[paymentMethod];

  const handleSubmit = (data: MobilePaymentFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>
            <div className="space-y-3">
              <h3 className="font-medium text-lg">{methodDetails.name} পেমেন্ট নির্দেশনা</h3>
              <div className="flex flex-col space-y-1">
                <p><strong>পেমেন্ট পরিমাণ:</strong> {amount} টাকা</p>
                {methodDetails.number && (
                  <p><strong>নম্বর/অ্যাকাউন্ট:</strong> {methodDetails.number} ({methodDetails.type})</p>
                )}
                <p>{methodDetails.instructions}</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {paymentMethod !== "cash" && (
          <>
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ট্রানজেকশন আইডি</FormLabel>
                  <FormControl>
                    <Input placeholder="উদাহরণ: TXN1234567" {...field} />
                  </FormControl>
                  <FormDescription>
                    পেমেন্ট করার পর আপনি যে ট্রানজেকশন আইডি পেয়েছেন
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>আপনার মোবাইল নম্বর</FormLabel>
                  <FormControl>
                    <Input placeholder="উদাহরণ: 01712345678" {...field} />
                  </FormControl>
                  <FormDescription>
                    যে নম্বর থেকে আপনি পেমেন্ট করেছেন
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>অতিরিক্ত তথ্য (যদি থাকে)</FormLabel>
              <FormControl>
                <Textarea placeholder="পেমেন্ট সম্পর্কে অতিরিক্ত কোন তথ্য দিতে চাইলে এখানে লিখুন" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="mr-2 animate-spin">◌</span>
              প্রক্রিয়াধীন...
            </>
          ) : (
            <>
              পেমেন্ট কনফার্ম করুন
              <span className="material-icons ml-2 text-sm">check_circle</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}