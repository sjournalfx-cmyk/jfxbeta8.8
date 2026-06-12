let _defaultTimezone = 'Africa/Johannesburg';

export const setDefaultTimezone = (tz: string) => {
    _defaultTimezone = tz;
};

export const getDefaultTimezone = (): string => _defaultTimezone;

export const getTimezoneLabel = (tz?: string): string => tz || _defaultTimezone;

export const getTimezoneOffset = (tz?: string): string => {
    const timezone = tz || _defaultTimezone;
    try {
        const parts = new Intl.DateTimeFormat('en', {
            timeZone: timezone,
            timeZoneName: 'longOffset',
        }).formatToParts(new Date());
        const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';
        const match = tzName.match(/GMT([+-]\d{2}:\d{2})/);
        return match ? match[1] : '+00:00';
    } catch {
        return '+02:00';
    }
};

const TIME_ONLY_RE = /^\d{1,2}:\d{2}(?::\d{2})?$/;
const DATE_TIME_MINUTES_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE_TIME_SECONDS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
const HAS_TIMEZONE_RE = /(Z|[+-]\d{2}:\d{2})$/;

const parseDateTimeInTimezone = (value: string, tz: string) => {
    if (TIME_ONLY_RE.test(value)) return null;

    const offsetStr = getTimezoneOffset(tz);
    let normalized = value;
    if (!HAS_TIMEZONE_RE.test(value)) {
        if (DATE_TIME_MINUTES_RE.test(value)) {
            normalized = `${value}:00${offsetStr}`;
        } else if (DATE_TIME_SECONDS_RE.test(value)) {
            normalized = `${value}${offsetStr}`;
        }
    }

    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getDateTimeInTimezone = (date = new Date(), timezone?: string) => {
    const tz = timezone || _defaultTimezone;
    const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

    const formatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(validDate);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');
    const second = getPart('second');

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hour}:${minute}`;
    const formattedFullTime = `${hour}:${minute}:${second}`;

    const localDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    const dayIndex = localDate.getUTCDay();

    return { 
        date: formattedDate, 
        time: formattedTime, 
        fullTime: formattedFullTime,
        dayIndex: dayIndex,
        hour: parseInt(hour || '0')
    };
};

export const getSastHourFromTime = (value?: string | null, timezone?: string): number | null => {
    const tz = timezone || _defaultTimezone;
    if (!value) return null;

    if (TIME_ONLY_RE.test(value)) {
        const [hour] = value.split(':').map(Number);
        return Number.isFinite(hour) ? hour : null;
    }

    const parsed = parseDateTimeInTimezone(value, tz);
    if (!parsed) return null;

    const hourParts = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        hour: '2-digit',
        hour12: false,
    }).formatToParts(parsed);

    const hour = Number(hourParts.find(part => part.type === 'hour')?.value);
    return Number.isFinite(hour) ? hour : null;
};

export const getSastHourFromTrade = (trade?: { date?: string; time?: string; openTime?: string; closeTime?: string }, timezone?: string) => {
    if (!trade) return null;

    const candidates = [
        trade.openTime,
        trade.time,
        trade.date && trade.time ? `${trade.date}T${trade.time}` : null,
        trade.closeTime,
    ];

    for (const candidate of candidates) {
        const hour = getSastHourFromTime(candidate, timezone);
        if (hour !== null) return hour;
    }

    return null;
};

export const getSastWeekdayFromDate = (date?: string | null, timezone?: string) => {
    const tz = timezone || _defaultTimezone;
    if (!date) return null;

    const offsetStr = getTimezoneOffset(tz);
    const parsed = new Date(`${date}T12:00:00${offsetStr}`);
    if (Number.isNaN(parsed.getTime())) return null;

    return parsed.toLocaleDateString('en-US', {
        timeZone: tz,
        weekday: 'short',
    });
};

export const getSASTDateTime = getDateTimeInTimezone;

export const ANALYTICS_TIMEZONE = 'Africa/Johannesburg';
export const ANALYTICS_TIMEZONE_LABEL = 'SAST';
