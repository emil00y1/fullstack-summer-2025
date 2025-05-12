// app/profile/ClientTabs.jsx
"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostItem from "@/components/PostItem";
import CommentItem from "@/components/CommentItem";

export default function ClientTabs({ posts, comments }) {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <Tabs
      defaultValue="posts"
      className="mt-6 px-4"
      onValueChange={setActiveTab}
    >
      <TabsList className="w-full border-b bg-accent">
        <TabsTrigger value="posts" className="flex-1 cursor-pointer">
          Posts
        </TabsTrigger>
        <TabsTrigger value="comments" className="flex-1 cursor-pointer">
          Comments
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="p-0">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No posts yet</div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="comments" className="p-0">
        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No comments yet</div>
        ) : (
          <div className="divide-y">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                showParentPost={true} // Show which post the comment was on
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
