import {
  Heart,
  MessageCircle,
  Repeat2,
  BarChart2,
  Bookmark,
  Share,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TwitterPost() {
  return (
    <div className="max-w-lg border border-gray-200 rounded-lg dark:border-gray-800 bg-white dark:bg-black text-black dark:text-white p-4">
      {/* Header with profile pic and name */}
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {/* User info */}
          <div className="flex items-center">
            <span className="font-bold mr-1">Derick</span>
            <span className="text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="text-gray-500 mx-1">@oku_yungx</span>
            <span className="text-gray-500 mx-1">·</span>
            <span className="text-gray-500">16t</span>
            <div className="ml-auto">
              <span className="text-gray-500">...</span>
            </div>
          </div>

          {/* Tweet content */}
          <div className="mt-1">
            <p className="text-base">I need that YAMAL's video ASAP please.</p>
            <p className="text-base mt-2">
              10k to the first person
              <span className="inline-flex items-center mx-1">
                <span className="h-4 w-4 bg-red-500 rounded-full inline-block"></span>
                <span className="h-4 w-4 bg-blue-500 rounded-full inline-block ml-1"></span>
                <span className="ml-1">😂</span>
              </span>
            </p>
          </div>

          {/* Engagement stats */}
          <div className="flex justify-between mt-4 text-gray-500 text-sm">
            <div className="flex items-center">
              <MessageCircle size={18} />
              <span className="ml-2">157</span>
            </div>
            <div className="flex items-center">
              <Repeat2 size={18} />
              <span className="ml-2">994</span>
            </div>
            <div className="flex items-center">
              <Heart size={18} />
              <span className="ml-2">24t</span>
            </div>
            <div className="flex items-center">
              <BarChart2 size={18} />
              <span className="ml-2">3 mio</span>
            </div>
            <div className="flex items-center">
              <Bookmark size={18} />
            </div>
            <div className="flex items-center">
              <Share size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
