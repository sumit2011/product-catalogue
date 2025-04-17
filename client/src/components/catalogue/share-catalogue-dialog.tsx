import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Catalogue } from "@shared/schema";

interface ShareCatalogueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogue: Catalogue;
}

export function ShareCatalogueDialog({ open, onOpenChange, catalogue }: ShareCatalogueDialogProps) {
  const { toast } = useToast();
  const [shareMessage, setShareMessage] = useState<string>(
    `Check out our ${catalogue.name} catalogue! Browse our latest products.`
  );
  const [shareUrl, setShareUrl] = useState<string>("");
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/catalogues/${catalogue.id}/share`, {
        message: shareMessage
      });
      return response.json();
    },
    onSuccess: (data) => {
      setShareUrl(data.catalogueUrl);
      setWhatsappUrl(data.whatsappUrl);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate share link: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleShareNow = () => {
    shareMutation.mutate();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "The catalogue link has been copied to your clipboard.",
    });
  };

  const handleWhatsAppShare = () => {
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Catalogue</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Shareable Link
            </label>
            <div className="flex">
              <Input
                readOnly
                value={shareUrl || "Generate a link using the button below"}
                className="flex-1 rounded-r-none"
              />
              <Button
                onClick={handleCopyLink}
                disabled={!shareUrl}
                className="rounded-l-none"
                type="button"
              >
                <i className="ri-file-copy-line"></i>
              </Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Custom Message (Optional)
            </label>
            <Textarea
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              rows={2}
              placeholder="Enter a custom message to send with your catalogue"
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Share via WhatsApp
            </label>
            <Button
              onClick={handleWhatsAppShare}
              disabled={!whatsappUrl}
              type="button"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <i className="ri-whatsapp-line mr-2"></i>
              Share on WhatsApp
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleShareNow}
            disabled={shareMutation.isPending}
          >
            {shareMutation.isPending ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Generating...
              </>
            ) : (
              "Generate Share Link"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
