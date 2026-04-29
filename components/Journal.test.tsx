import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import Journal from './Journal';
import { Trade, UserProfile } from '../types';

describe('Journal Calendar P&L Coloring', () => {
  const mockUserProfile: UserProfile = {
    name: 'Test User',
    country: 'US',
    accountName: 'Test Account',
    initialBalance: 1000,
    currency: 'USD',
    currencySymbol: '$',
    syncMethod: 'Manual',
    experienceLevel: 'Intermediate',
    tradingStyle: 'Scalper',
    onboarded: true,
    plan: 'FREE TIER (JOURNALER)',
    syncKey: '',
    eaConnected: false,
    avatarUrl: '',
    themePreference: 'obsidian',
    chartConfig: {},
    keepChartsAlive: false,
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const mockTrades: Trade[] = [
    {
      id: '1',
      ticketId: '1',
      pair: 'EURUSD',
      assetType: 'Forex',
      date: dateStr,
      time: '10:00',
      session: 'morning',
      direction: 'Long',
      entryPrice: 1.05,
      exitPrice: 1.06,
      stopLoss: 1.04,
      takeProfit: 1.07,
      lots: 0.1,
      result: 'Win',
      pnl: -3,
      rr: 2,
      rating: 5,
      tags: [],
      notes: '',
      emotions: ['calm'],
      planAdherence: 'Followed Exactly',
      tradingMistake: 'None',
      mindset: '',
      exitComment: '',
      openTime: '',
      closeTime: '',
      beforeScreenshot: null,
      afterScreenshot: null,
    },
  ];

  it('should render P&L with rose-500 color for -3$ P&L in calendar view', () => {
    const { container, getByLabelText } = render(
      <Journal
        isDarkMode={false}
        trades={mockTrades}
        onUpdateTrade={() => {}}
        onBatchUpdateTrades={async () => true}
        onDeleteTrades={() => {}}
        onEditTrade={() => {}}
        userProfile={mockUserProfile}
      />
    );

    // Switch to calendar view
    const calendarBtn = getByLabelText('Switch to Calendar View');
    fireEvent.click(calendarBtn);

    // The -3$ P&L should have the 'text-rose-500' class
    const pnlDisplays = container.querySelectorAll('.text-rose-500');
    const pnlDisplay = Array.from(pnlDisplays).find(el => el.textContent?.includes('-$3.00'));
    expect(pnlDisplay).toBeTruthy();

    // The background should be 'bg-rose-50' for light mode negative P&L
    // Note: Use a more flexible selector if necessary, or check the specific div
    const allDivs = container.querySelectorAll('div');
    const negativeDayDiv = Array.from(allDivs).find(div => div.className.includes('bg-rose-50'));
    expect(negativeDayDiv).toBeTruthy();
  });
});
