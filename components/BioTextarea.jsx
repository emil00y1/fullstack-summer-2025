"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function BioTextarea({ defaultValue = "" }) {
  const [bioLength, setBioLength] = useState(defaultValue.length);

  const maxLength = 160;

  const handleBioChange = (e) => {
    setBioLength(e.target.value.length);
  };

  return (
    <div className="grid space-y-2">
      <Textarea
        id="bio"
        name="bio"
        placeholder="Tell us about yourself"
        resize="none"
        className="resize-none"
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleBioChange}
      />
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Your bio appears on your profile.
        </p>
        <span
          className={`text-sm ${
            bioLength > maxLength * 0.9
              ? bioLength >= maxLength
                ? "text-red-500"
                : "text-amber-500"
              : "text-gray-500"
          }`}
        >
          {bioLength}/{maxLength}
        </span>
      </div>
    </div>
  );
}
