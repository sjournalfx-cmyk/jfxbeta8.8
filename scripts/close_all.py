import MetaTrader5 as mt5
import json

if not mt5.initialize():
    print(json.dumps({"error": str(mt5.last_error())}))
    exit()

positions = mt5.positions_get()
if positions is None or len(positions) == 0:
    print(json.dumps({"success": True, "closed": 0}))
    mt5.shutdown()
    exit()

closed_count = 0
for pos in positions:
    tick = mt5.symbol_info_tick(pos.symbol)
    if tick is None:
        continue
    
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": pos.symbol,
        "volume": pos.volume,
        "type": mt5.ORDER_TYPE_SELL if pos.type == 0 else mt5.ORDER_TYPE_BUY,
        "price": tick.bid if pos.type == 0 else tick.ask,
        "deviation": 100,
        "comment": "cleanup",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_FOK,
    }
    
    result = mt5.order_send(request)
    if result.retcode == mt5.TRADE_RETCODE_DONE:
        closed_count += 1

print(json.dumps({"success": True, "closed": closed_count}))
mt5.shutdown()