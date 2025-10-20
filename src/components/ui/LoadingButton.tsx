// src/components/ui/LoadingButton.tsx

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import * as React from "react";

// Assuming your base Button component uses standard React/HTML button props.
// We define a universal type that combines the button's standard attributes
// with our custom ones, resolving the issue where ButtonProps is not exported.

// FIX 1: Use React's standard HTML attributes for a button and combine them 
// with the return type of the Button component (if it were known). 
// Since ButtonProps is missing, we extend React.ButtonHTMLAttributes.

type BaseButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

interface LoadingButtonProps extends BaseButtonProps {
  isLoading: boolean;
  loadingText?: string;
  // Note: children and disabled are now correctly inherited from BaseButtonProps
}

/**
 * A reusable button component that displays a spinner when isLoading is true.
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText = "Please wait...",
  children, // Now correctly typed and destructured
  disabled, // Now correctly typed and destructured
  ...props
}) => {
  return (
    <Button 
      type="submit" 
      // FIX 2: Use the combination of isLoading and passed-in disabled state
      disabled={isLoading || disabled} 
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children // Show original text/children when not loading
      )}
    </Button>
  );
};