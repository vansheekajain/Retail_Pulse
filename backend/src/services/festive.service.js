const dayjs = require('dayjs');

// Indian festive calendar — approximate dates
const FESTIVE_DATES = {
  '2024': [
    { name: 'Diwali',        date: '2024-11-01', impactDays: 7  },
    { name: 'Dussehra',      date: '2024-10-12', impactDays: 3  },
    { name: 'Holi',          date: '2024-03-25', impactDays: 3  },
    { name: 'Eid ul-Fitr',   date: '2024-04-10', impactDays: 3  },
    { name: 'Eid ul-Adha',   date: '2024-06-17', impactDays: 3  },
    { name: 'Navratri',      date: '2024-10-03', impactDays: 9  },
    { name: 'Christmas',     date: '2024-12-25', impactDays: 2  },
    { name: 'New Year',      date: '2024-12-31', impactDays: 2  },
    { name: 'Republic Day',  date: '2024-01-26', impactDays: 1  },
    { name: 'Independence',  date: '2024-08-15', impactDays: 1  },
  ],
  '2025': [
    { name: 'Holi',          date: '2025-03-14', impactDays: 3  },
    { name: 'Eid ul-Fitr',   date: '2025-03-30', impactDays: 3  },
    { name: 'Eid ul-Adha',   date: '2025-06-06', impactDays: 3  },
    { name: 'Navratri',      date: '2025-09-22', impactDays: 9  },
    { name: 'Dussehra',      date: '2025-10-02', impactDays: 3  },
    { name: 'Diwali',        date: '2025-10-20', impactDays: 7  },
    { name: 'Christmas',     date: '2025-12-25', impactDays: 2  },
    { name: 'New Year',      date: '2025-12-31', impactDays: 2  },
    { name: 'Republic Day',  date: '2025-01-26', impactDays: 1  },
    { name: 'Independence',  date: '2025-08-15', impactDays: 1  },
  ],
  '2026': [
    { name: 'Republic Day',  date: '2026-01-26', impactDays: 1  },
    { name: 'Holi',          date: '2026-03-03', impactDays: 3  },
    { name: 'Eid ul-Fitr',   date: '2026-03-20', impactDays: 3  },
    { name: 'Eid ul-Adha',   date: '2026-05-27', impactDays: 3  },
    { name: 'Independence',  date: '2026-08-15', impactDays: 1  },
    { name: 'Navratri',      date: '2026-10-11', impactDays: 9  },
    { name: 'Dussehra',      date: '2026-10-20', impactDays: 3  },
    { name: 'Diwali',        date: '2026-11-08', impactDays: 7  },
    { name: 'Christmas',     date: '2026-12-25', impactDays: 2  },
    { name: 'New Year',      date: '2026-12-31', impactDays: 2  },
  ],
};

// Check if a date falls within a festive window
exports.getFestiveInfo = (date) => {
  const d    = dayjs(date);
  const year = d.format('YYYY');
  const festiveDates = FESTIVE_DATES[year] || [];

  for (const fest of festiveDates) {
    const festStart = dayjs(fest.date).subtract(2, 'day');
    const festEnd   = dayjs(fest.date).add(fest.impactDays, 'day');

    if (d.isAfter(festStart) && d.isBefore(festEnd)) {
      return { isFestive: true, name: fest.name };
    }
  }

  return { isFestive: false, name: null };
};

// Get all festive dates in a range
exports.getFestivesInRange = (from, to) => {
  const start = dayjs(from);
  const end   = dayjs(to);
  const year  = start.format('YYYY');
  const festiveDates = FESTIVE_DATES[year] || [];

  return festiveDates.filter(f => {
    const d = dayjs(f.date);
    return d.isAfter(start) && d.isBefore(end);
  });
};

// Get uplift multiplier for festive days
exports.getFestiveMultiplier = (festiveName) => {
  const multipliers = {
    'Diwali':       2.5,
    'Holi':         1.8,
    'Navratri':     1.6,
    'Dussehra':     1.5,
    'Eid ul-Fitr':  1.7,
    'Eid ul-Adha':  1.5,
    'Christmas':    1.3,
    'New Year':     1.4,
    'Republic Day': 1.1,
    'Independence': 1.1,
  };
  return multipliers[festiveName] || 1.2;
};