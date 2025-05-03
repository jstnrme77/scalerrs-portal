'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Button as CustomButton from '@/components/ui/forms/Button';
import { Badge } from '@/components/ui/badge';
import Badge as CustomBadge from '@/components/ui/badges/Badge';

export default function StyleGuide() {
  return (
    <div className="p-8 space-y-12 font-roboto">
      <div>
        <h1 className="mb-8">Typography</h1>
        <div className="space-y-6">
          <div>
            <h1>H1 - The Quick Brown Fox Jumps Over The Lazy Dog.</h1>
            <p className="text-sm text-gray-500 mt-2">Font: Roboto | Weight: Medium | Size: 2rem (32px) | Line Height: 1.2 | Letter Spacing: -0.5px</p>
          </div>
          <div>
            <h2>H2 - The quick brown fox jumps over the lazy dog.</h2>
            <p className="text-sm text-gray-500 mt-2">Font: Roboto | Weight: Medium | Size: 1.75rem (28px) | Line Height: 1.2 | Letter Spacing: -0.5px</p>
          </div>
          <div>
            <h3>H3 - The quick brown fox jumps over the lazy dog.</h3>
            <p className="text-sm text-gray-500 mt-2">Font: Roboto | Weight: Medium | Size: 1.5rem (24px) | Line Height: 1.2 | Letter Spacing: -0.25px</p>
          </div>
          <div>
            <p>Body - The quick brown fox jumps over the lazy dog.</p>
            <p className="text-sm text-gray-500 mt-2">Font: Roboto | Weight: Regular | Size: 1rem (16px) | Line Height: 1.5 | Letter Spacing: 0px</p>
          </div>
          <div>
            <p className="small-text">Small Text - The quick brown fox jumps over the lazy dog.</p>
            <p className="text-sm text-gray-500 mt-2">Font: Roboto | Weight: Regular | Size: 0.875rem (14px) | Line Height: 1.5 | Letter Spacing: 0px</p>
          </div>
        </div>
      </div>

      <div>
        <h1 className="mb-8">Colour Palette</h1>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="h-24 w-full bg-[#9EA8FB] rounded-md mb-2"></div>
            <p className="font-bold">HEX: #9EA8FB</p>
            <p>Usage: Accent 1, Buttons, Highlights, CTAs</p>
          </div>
          <div>
            <div className="h-24 w-full bg-[#12131C] rounded-md mb-2"></div>
            <p className="font-bold">HEX: #12131C</p>
            <p>Usage: Headers, text, footers</p>
          </div>
          <div>
            <div className="h-24 w-full bg-[#EADCFF] rounded-md mb-2"></div>
            <p className="font-bold">HEX: #EADCFF</p>
            <p>Usage: Accent 3, icons, borders, cards backgrounds</p>
          </div>
          <div>
            <div className="h-24 w-full bg-[#FCDC94] rounded-md mb-2"></div>
            <p className="font-bold">HEX: #FCDC94</p>
            <p>Usage: Accent 2, icons, borders, cards backgrounds</p>
          </div>
          <div>
            <div className="h-24 w-full bg-[#FFFFFF] rounded-md border mb-2"></div>
            <p className="font-bold">HEX: #FFFFFF</p>
            <p>Usage: background, text, section dividers</p>
          </div>
          <div>
            <div className="h-24 w-full bg-[#D9D9D9] rounded-md mb-2"></div>
            <p className="font-bold">HEX: #D9D9D9</p>
            <p>Usage: background, section dividers</p>
          </div>

        </div>
      </div>

      <div>
        <h1 className="mb-8">Button Styles</h1>
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl">Primary CTA</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Primary Button</Button>
              <CustomButton variant="primary">Primary Button</CustomButton>
            </div>
            <p>Shape Style: Rectangle, Colour Fill | Corner Radius: 16px | Shape Colour Hex:#12131C | Text Colour Hex:#FFFFFF</p>
            <p>Font name: Roboto | Font weight: Bold | Font size: 16px | Line height: 24px | Letter Spacing: 0px</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl">Secondary CTA</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary">Secondary Button</Button>
              <CustomButton variant="secondary">Secondary Button</CustomButton>
            </div>
            <p>Shape Style: Rectangle, Border | Corner Radius: 16px | Shape Colour Hex:#FFFFFF | Text Colour Hex:#12131C</p>
            <p>BorderColour: #12131C | Border weight: 1px | Font name: Roboto | Font weight: Bold | Font size: 16px | Line height: 24px | Letter Spacing: 0px</p>
          </div>

          {/* Dark Background section removed as we're standardizing on primary/secondary/tertiary */}

          <div className="space-y-4">
            <h3 className="text-xl">Tertiary CTA</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="link">Tertiary Button</Button>
              <CustomButton variant="tertiary">Tertiary Button</CustomButton>
            </div>
            <p>Shape Style: No Fill, Bottom Border Only | Border Weight: 1px | Text + Elements Colour Hex:#9EA8FB</p>
            <p>Font name: Roboto | Font weight: Bold | Font size: 20px | Line height: 30px | Letter Spacing: 0px</p>
          </div>
        </div>
      </div>

      <div>
        <h1 className="mb-8">Badge Styles</h1>
        <div className="flex flex-wrap gap-4">
          <Badge>Default Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
          <Badge variant="destructive">Destructive Badge</Badge>
          <CustomBadge>Default Badge</CustomBadge>
          <CustomBadge variant="secondary">Secondary Badge</CustomBadge>
          <CustomBadge variant="warning">Warning Badge</CustomBadge>
          <CustomBadge variant="danger">Danger Badge</CustomBadge>
        </div>
      </div>

      <div>
        <h1 className="mb-8">Theme Examples</h1>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="mb-4">Light Theme</h3>
            <p>This is how content looks in light theme.</p>
            <div className="mt-4">
              <Button>Primary Button</Button>
            </div>
          </div>
          <div className="p-6 bg-[#12131C] rounded-lg text-white">
            <h3 className="mb-4 text-white">Dark Theme</h3>
            <p className="text-white">This is how content looks in dark theme.</p>
            <div className="mt-4">
              <Button>Primary Button</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
