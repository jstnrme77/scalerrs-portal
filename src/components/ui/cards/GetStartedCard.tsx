'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GetStartedCardProps {
  title: string;
  bgColor: string;
  buttonText: string;
  buttonColor: string;
  icon: React.ReactNode;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export default function GetStartedCard({
  title,
  bgColor,
  buttonText,
  buttonColor,
  icon,
  description,
  onClick,
  className,
}: GetStartedCardProps) {
  return (
    <div
      className={cn(
        "card flex flex-col p-6 rounded-[16px] h-full min-h-[280px] bg-white shadow-sm",
        className
      )}
      style={{ color: '#353233' }}
    >
      <div className="flex items-start mb-4">
        {icon}
        <h2 className="text-xl font-semibold ml-3">{title}</h2>
      </div>

      {description && (
        <p className="text-gray-600 mb-6 flex-grow">{description}</p>
      )}

      <button
        onClick={onClick}
        className={cn(
          "px-6 py-3 rounded-[16px] transition-colors w-full text-center",
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
  description,
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
  description?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "card p-6 rounded-[16px] h-full min-h-[280px] flex flex-col bg-white shadow-sm",
        className
      )}
      style={{ color: '#353233' }}
    >
      <div className="flex items-start mb-4">
        <div className="w-12 h-12 bg-[#e8eeff] rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9ea8fb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold ml-3">{title}</h2>
      </div>

      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}

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
            "px-6 py-3 rounded-[16px] transition-colors w-full text-center mt-4",
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
        "card p-6 rounded-[16px] h-full min-h-[280px]",
        bgColor,
        className
      )}
      style={{ color: '#353233' }}
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
  description,
  onClick,
  className,
}: {
  title: string;
  bgColor: string;
  completedTasks: number;
  totalTasks: number;
  buttonText: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}) {
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <div
      className={cn(
        "card p-6 rounded-lg h-full min-h-[280px] flex flex-col bg-white shadow-sm",
        className
      )}
      style={{ color: '#353233' }}
    >
      <div className="flex items-start mb-4">
        <div className="w-12 h-12 bg-[#e8eeff] rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9ea8fb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold ml-3">{title}</h2>
      </div>

      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}

      <div className="flex-grow flex flex-col justify-center items-center mb-6">
        <div className="relative w-24 h-24 mb-4">
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
