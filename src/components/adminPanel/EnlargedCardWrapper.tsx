import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EnlargedContentProps {
  title: string;

  children: React.ReactNode;

  className?: string;
}

/**

* Reusable component to wrap content that should be displayed in an enlarged dialog.

*/

export const EnlargedCardWrapper: React.FC<EnlargedContentProps> = ({
  title,
  children,
  className = "sm:max-w-xl md:max-w-2xl bg-gray-900 text-white",
}) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  return (
    <Dialog open={isEnlarged} onOpenChange={setIsEnlarged}>
      <DialogTrigger asChild>
        {/* The child component (the card) becomes the trigger */}

        {children}
      </DialogTrigger>

      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* The content to display when enlarged (must be passed via a separate prop) */}

        {/* We use a temporary placeholder here since the specific content should be defined by the caller */}
      </DialogContent>
    </Dialog>
  );
};

// We don't need a separate hook, but we can export the Dialog controls if needed

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger };
