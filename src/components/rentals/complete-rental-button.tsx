"use client";

import { useState } from "react";
import { completeRental } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

interface CompleteRentalButtonProps {
  rentalId: string;
}

export function CompleteRentalButton({ rentalId }: CompleteRentalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleComplete = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setLoading(true);
    await completeRental(rentalId);
  };

  if (loading) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Finalizando...
      </Button>
    );
  }

  return (
    <Button
      variant={confirmed ? "destructive" : "default"}
      onClick={handleComplete}
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      {confirmed ? "¿Confirmar finalización?" : "Finalizar Contrato"}
    </Button>
  );
}
