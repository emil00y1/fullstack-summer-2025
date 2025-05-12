"use client";
import { Button } from "./ui/button";

function BackButton() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="mr-6">
      <Button variant="ghost" className="cursor-pointer" onClick={handleGoBack}>
        ←
      </Button>
    </div>
  );
}

export default BackButton;
