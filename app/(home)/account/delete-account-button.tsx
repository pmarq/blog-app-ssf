"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
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
} from "@/app/components/ui/alert-dialog";
import { removeToken } from "@/context/action";

import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useState } from "react";

export default function DeleteAccountButton() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");

  const handleDeleteClick = async () => {
    if (auth?.currentUser?.email) {
      setIsDeleting(true);
      try {
        await reauthenticateWithCredential(
          auth.currentUser,
          EmailAuthProvider.credential(auth.currentUser.email, password)
        );
        /* await deleteUserFavourites(); */
        await deleteUser(auth.currentUser);
        await removeToken();
        toast({
          title: "Your account was deleted successfully",
          variant: "success",
        });
      } catch (e: any) {
        toast({
          title:
            e.code === "auth/invalid-credential"
              ? "Your current password is incorrect"
              : "An error occurred",
          variant: "destructive",
        });
      }
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete your account?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
              <div>
                <Label>Enter current password to continue</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteClick} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
