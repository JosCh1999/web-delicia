import React from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="grid gap-1">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground/90">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
