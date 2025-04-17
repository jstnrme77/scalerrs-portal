'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GetStartedCardProps {
  title: string;
  bgColor: string;
  buttonText: string;
  buttonColor: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function GetStartedCard({
  title,
  bgColor,
  buttonText,
  buttonColor,
  icon,
  onClick,
  className,
}: GetStartedCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center p-6 rounded-lg h-full min-h-[280px]",
        bgColor,
        className
      )}
    >
      <h2 className="text-xl font-semibold mb-6 text-center">{title}</h2>

      <div className="flex justify-center items-center flex-grow mb-6">
        {icon}
      </div>

      <button
        onClick={onClick}
        className={cn(
          "px-6 py-3 rounded-md transition-colors w-full text-center",
          `bg-white hover:bg-opacity-90`
        )}
        style={{
          color: 'var(--brand-1)',
          borderWidth: '1.5px',
          borderStyle: 'solid',
          borderColor: 'var(--brand-1)',
          height: '48px'
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}

export function GuideCard({
  title,
  bgColor,
  items,
  className,
  buttonText,
  onClick,
}: {
  title: string;
  bgColor: string;
  items: {
    icon: React.ReactNode;
    text: string;
    bgColor: string;
  }[];
  className?: string;
  buttonText?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "p-6 rounded-lg h-full min-h-[280px] flex flex-col",
        bgColor,
        className
      )}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4 flex-grow">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={cn("w-8 h-8 rounded flex items-center justify-center mr-3", item.bgColor)}>
              {item.icon}
            </div>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      {buttonText && (
        <button
          onClick={onClick}
          className={cn(
            "px-6 py-3 rounded-md transition-colors w-full text-center mt-4",
            `bg-white hover:bg-opacity-90`
          )}
          style={{
            color: 'var(--brand-1)',
            borderWidth: '1.5px',
            borderStyle: 'solid',
            borderColor: 'var(--brand-1)',
            height: '48px'
          }}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export function QuickLinksCard({
  title,
  bgColor,
  links,
  className,
}: {
  title: string;
  bgColor: string;
  links: {
    icon: React.ReactNode | string;
    href: string;
    isExternal?: boolean;
  }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-6 rounded-lg h-full min-h-[280px]",
        bgColor,
        className
      )}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex justify-center space-x-8 py-4">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target={link.isExternal ? "_blank" : undefined}
            rel={link.isExternal ? "noopener noreferrer" : undefined}
            className="flex items-center justify-center"
          >
            {typeof link.icon === 'string' ? (
              <img src={link.icon} alt="" className="h-12 w-12" />
            ) : (
              link.icon
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

export function ChecklistCard({
  title,
  bgColor,
  completedTasks,
  totalTasks,
  buttonText,
  onClick,
  className,
}: {
  title: string;
  bgColor: string;
  completedTasks: number;
  totalTasks: number;
  buttonText: string;
  onClick?: () => void;
  className?: string;
}) {
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <div
      className={cn(
        "p-6 rounded-lg h-full min-h-[280px] flex flex-col",
        bgColor,
        className
      )}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="flex-grow flex flex-col justify-center items-center mb-6">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--brand-1)"
              strokeWidth="8"
              strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
            {completedTasks}/{totalTasks}
          </div>
        </div>
        <p className="text-center text-gray-600">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>

      <button
        onClick={onClick}
        className={cn(
          "px-6 py-3 rounded-md transition-colors w-full text-center",
          `bg-white hover:bg-opacity-90`
        )}
        style={{
          color: 'var(--brand-1)',
          borderWidth: '1.5px',
          borderStyle: 'solid',
          borderColor: 'var(--brand-1)',
          height: '48px'
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}
