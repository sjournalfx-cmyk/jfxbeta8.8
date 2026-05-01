import MetaTrader5 as mt5
import json
from datetime import datetime

if not mt5.initialize():
    print(json.dumps({"error": mt5.last_error()}))
    exit()

positions = mt5.positions_get()
if positions is None:
    print(json.dumps({"positions": []}))
    mt5.shutdown()
    exit()

positions_data = []
for pos in positions:
    positions_data.append({
        "ticket": pos.ticket,
        "symbol": pos.symbol,
        "type": "SELL" if pos.type == 1 else "BUY",
        "volume": pos.volume,
        "price_open": pos.price_open,
        "price_current": pos.price_current,
        "profit": pos.profit,
        "sl": pos.sl,
        "tp": pos.tp,
        "magic": pos.magic,
        "comment": pos.comment or "",
        "time": pos.time
    })

print(json.dumps({"positions": positions_data}))

mt5.shutdown()