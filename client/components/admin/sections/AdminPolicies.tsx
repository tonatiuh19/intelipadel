import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateClubPolicy } from "@/store/slices/adminPoliciesSlice";

export default function AdminPolicies() {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((state) => state.adminPolicies);
  const { admin } = useAppSelector((state) => state.adminAuth);
  const clubId = admin?.club_id || 1;
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [termsOfService, setTermsOfService] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (clubId) {
      fetchPolicies();
    }
  }, [clubId]);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);

      const [terms, privacy, cancellation] = await Promise.all([
        axios.get(`/api/clubs/${clubId}/policies/terms`),
        axios.get(`/api/clubs/${clubId}/policies/privacy`),
        axios.get(`/api/clubs/${clubId}/policies/cancellation`),
      ]);

      setTermsOfService(terms.data.data?.content || "");
      setPrivacyPolicy(privacy.data.data?.content || "");
      setCancellationPolicy(cancellation.data.data?.content || "");
    } catch (err) {
      console.error("Failed to fetch policies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (policyType: string, content: string) => {
    try {
      await dispatch(
        updateClubPolicy({
          club_id: clubId,
          policy_type: policyType, // 'terms' or 'privacy'
          content,
        }),
      ).unwrap();

      toast({ title: "Política guardada exitosamente" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err || "Error al guardar política",
        variant: "destructive",
      });
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Términos y Políticas
        </h1>
        <p className="text-gray-600 mt-1">
          Administra documentos legales y políticas del club
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Políticas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando políticas...
            </div>
          ) : (
            <Tabs defaultValue="privacy" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="privacy">
                  Política de Privacidad
                </TabsTrigger>
                <TabsTrigger value="terms">Términos de Servicio</TabsTrigger>
                <TabsTrigger value="cancellation">
                  Política de Cancelación
                </TabsTrigger>
              </TabsList>

              <TabsContent value="privacy" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={privacyPolicy}
                    onChange={setPrivacyPolicy}
                    modules={modules}
                    style={{ minHeight: "400px" }}
                  />
                </div>
                <Button
                  onClick={() => handleSave("privacy", privacyPolicy)}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting
                    ? "Guardando..."
                    : "Guardar Política de Privacidad"}
                </Button>
              </TabsContent>

              <TabsContent value="terms" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={termsOfService}
                    onChange={setTermsOfService}
                    modules={modules}
                    style={{ minHeight: "400px" }}
                  />
                </div>
                <Button
                  onClick={() => handleSave("terms", termsOfService)}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting
                    ? "Guardando..."
                    : "Guardar Términos de Servicio"}
                </Button>
              </TabsContent>

              <TabsContent value="cancellation" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={cancellationPolicy}
                    onChange={setCancellationPolicy}
                    modules={modules}
                    style={{ minHeight: "400px" }}
                  />
                </div>
                <Button
                  onClick={() => handleSave("cancellation", cancellationPolicy)}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting
                    ? "Guardando..."
                    : "Guardar Política de Cancelación"}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
