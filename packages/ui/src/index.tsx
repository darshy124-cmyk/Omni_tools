import React from "react";
import clsx from "clsx";

export const Button = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={clsx(
      "rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800",
      className
    )}
    {...props}
  >
    {children}
  </button>
);
