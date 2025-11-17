import React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="40"
      height="40"
      {...props}
    >
      <path
        fill="hsl(var(--primary))"
        d="M50,10 C20,10 10,40 10,60 C10,90 40,95 50,95 C60,95 90,90 90,60 C90,40 80,10 50,10 Z"
      />
      <path
        fill="hsl(var(--accent))"
        d="M50,15 C75,15 85,40 85,58 C85,80 60,85 50,85 C40,85 15,80 15,58 C15,40 25,15 50,15 Z"
      />
      <circle cx="50" cy="25" r="5" fill="hsl(var(--destructive))" />
    </svg>
  );
}
