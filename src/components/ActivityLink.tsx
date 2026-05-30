import { isDiscordActivity, openExternalLink } from "../lib/discord";
import React from 'react'

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export const ActivityLink = ({ href, className, children }: Props) => {
  if (isDiscordActivity) {
    return (
      <button
        type="button"
        onClick={() => openExternalLink(href)}
        className={className}
      >
        {children}
      </button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
};
