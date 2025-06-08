"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";

export default function DeleteAccountDialog({ onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await onDelete();
      
      if (result.success) {
        // Force a full page refresh to clear session
        await signOut();
      } else {
        alert(result.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmValid = confirmText === "DELETE";

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              This action will permanently delete your account and all associated data including:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>All your posts and comments</li>
              <li>All likes and follows</li>
              <li>Your profile information</li>
              <li>All uploaded images</li>
            </ul>
            <p className="font-medium text-destructive">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="confirm-delete" className="text-sm font-medium">
            Type "DELETE" to confirm:
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="mt-2"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel 
            className="cursor-pointer"
            onClick={() => {
              setConfirmText("");
              setIsOpen(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="cursor-pointer bg-red-700 hover:bg-red-800 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              "Delete Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}