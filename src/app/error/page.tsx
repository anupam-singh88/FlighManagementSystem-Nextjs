"use client"
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CustomError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errMsg = searchParams.get("error") || "Internal Server Error";
  const statusCode = searchParams.get("status") || 500;

  const getErrorMessage = (status : any) => {
    switch (status) {
      case 404:
        return "Sorry, the page you are looking for does not exist.";
      case 500:
      default:
        return "Sorry, something went wrong on our end.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-center">{statusCode} - {errMsg}</h1>
      <p className="mb-4">{getErrorMessage(statusCode)}</p>
      <div className="flex space-x-4">
        <Button
          onClick={() => router.back()}
          className="w-auto mt-2"
          variant="destructive"
        >
          Try Again
        </Button>
        <Button
          onClick={() => router.push('/')}
          className="w-auto mt-2"
          variant="default"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}
