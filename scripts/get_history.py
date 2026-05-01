import MetaTrader5 as mt5
import json
import sys
from datetime import datetime, timedelta

if not mt5.initialize():
    print(json.dumps({"error": mt5.last_error()}))
    exit()

if len(sys.argv) >= 3:
    from_date = datetime.fromisoformat(sys.argv[1])
    to_date = datetime.fromisoformat(sys.argv[2])
else:
    to_date = datetime.now()
    from_date = to_date - timedelta(days=30)

deals = mt5.history_deals_get(from_date, to_date)
if deals is None:
    print(json.dumps({"deals": []}))
    mt5.shutdown()
    exit()

deals_data = []
for deal in deals:
    deals_data.append({
        "ticket": deal.ticket,
        "order": deal.order,
        "symbol": deal.symbol,
        "type": "SELL" if deal.type == 1 else "BUY",
        "volume": deal.volume,
        "price_open": deal.price,
        "price_close": deal.price_closed if deal.price_closed else deal.price,
        "profit": deal.profit,
        "commission": deal.commission,
        "swap": deal.swap,
        "magic": deal.magic,
        "comment": deal.comment or "",
        "time_open": deal.time,
        "time_closed": deal.time_closed if deal.time_closed else 0
    })

print(json.dumps({"deals": deals_data}))

mt5.shutdown()