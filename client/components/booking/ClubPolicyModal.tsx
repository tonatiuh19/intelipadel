import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchClubPolicy, clearPolicy } from "@/store/slices/clubPoliciesSlice";

interface ClubPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: number;
  policyType: "terms" | "privacy" | "cancellation";
}

export default function ClubPolicyModal({
  open,
  onOpenChange,
  clubId,
  policyType,
}: ClubPolicyModalProps) {
  const dispatch = useAppDispatch();
  const { policy, loading, error } = useAppSelector(
    (state) => state.clubPolicies,
  );

  useEffect(() => {
    if (open && clubId) {
      dispatch(fetchClubPolicy({ clubId, policyType }));
    }

    // Clear policy when modal closes
    return () => {
      if (!open) {
        dispatch(clearPolicy());
      }
    };
  }, [open, clubId, policyType, dispatch]);

  const getTitle = () => {
    switch (policyType) {
      case "terms":
        return "Términos y Condiciones";
      case "privacy":
        return "Política de Privacidad";
      case "cancellation":
        return "Política de Cancelación";
      default:
        return "Política";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {!loading && !error && policy && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b text-sm text-muted-foreground">
                <span>Versión: {policy.version}</span>
                <span>
                  Vigente desde:{" "}
                  {new Date(policy.effective_date).toLocaleDateString("es-MX")}
                </span>
              </div>

              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: policy.content }}
              />

              {policyType === "cancellation" &&
                policy.hours_before_cancellation && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">
                      Información Importante
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • Cancelación permitida hasta:{" "}
                        {policy.hours_before_cancellation} horas antes
                      </li>
                      {policy.refund_percentage !== undefined && (
                        <li>• Reembolso: {policy.refund_percentage}%</li>
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
