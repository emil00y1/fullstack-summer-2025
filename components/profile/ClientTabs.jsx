// components/profile/ClientTabs.jsx
"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostItem from "@/components/PostItem";
import CommentItem from "@/components/CommentItem";

export default function ClientTabs(
  { posts = [], comments = [] },
  isAdmin = false
) {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <Tabs
      defaultValue="posts"
      className="w-full px-2 mt-4"
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full grid-cols-2 mb-2">
        <TabsTrigger value="posts" className="cursor-pointer">
          Posts ({posts.length})
        </TabsTrigger>
        <TabsTrigger value="comments" className="cursor-pointer">
          Comments ({comments.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="space-y-2 pb-20">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostItem key={post.encryptedId} post={post} isAdmin={isAdmin} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No posts to show</p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="comments" className="space-y-2 pb-20">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.encryptedId}
              comment={comment}
              showParentPost={true}
              isAdmin={isAdmin}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No comments to show</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
