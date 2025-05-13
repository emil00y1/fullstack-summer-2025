"use client";
import { Dialog, DialogTitle, DialogTrigger, DialogContent } from "./ui/dialog";
import { CreatePost } from "./CreatePost";
import { SessionProvider } from "next-auth/react";

function PostDialog() {
  return (
    <Dialog>
      <DialogTrigger className="rounded-4xl max-w-52 font-bold cursor-pointer mt-4 min-w-0 flex w-12 h-12 lg:w-full items-center justify-center p-0 lg:h-auto lg:p-3 lg:max-w-52 bg-blue-500 hover:bg-blue-600">
        <span className="lg:inline hidden text-white">Post</span>
        <span className="lg:hidden inline font-bold text-lg text-white">+</span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Post</DialogTitle>
        <SessionProvider>
          <CreatePost />
        </SessionProvider>
      </DialogContent>
    </Dialog>
  );
}

export default PostDialog;
