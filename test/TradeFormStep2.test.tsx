import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TradeFormStep2 } from '../components/log-trade/TradeFormStep2';
import React from 'react';

describe('TradeFormStep2', () => {
    const defaultProps = {
        formData: {
            direction: 'Long',
            lots: '1.00',
            entryPrice: '1.2000',
            exitPrice: '1.2100',
            stopLoss: '1.1900',
            takeProfit: '1.2200',
            result: 'Win'
        },
        handleInputChange: () => {},
        isDarkMode: false,
        isDesktopBridgeTrade: true
    };

    it('should not show the "Entry price and exit price are locked" message even if isDesktopBridgeTrade is true', () => {
        render(<TradeFormStep2 {...defaultProps} />);

        const message = screen.queryByText(/Entry price and exit price are locked for desktop bridge trades/i);
        expect(message).toBeNull();
    });

    it('should still show the "Trade outcome is locked" message if isDesktopBridgeTrade is true', () => {
        render(<TradeFormStep2 {...defaultProps} />);

        const message = screen.queryByText(/Trade outcome is locked for desktop bridge trades/i);
        expect(message).not.toBeNull();
    });
});
