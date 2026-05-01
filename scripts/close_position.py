import MetaTrader5 as mt5
import json
import sys

if not mt5.initialize():
    print(json.dumps({"error": str(mt5.last_error())}))
    sys.exit()

ticket = int(sys.argv[1]) if len(sys.argv) > 1 else None

if not ticket:
    print(json.dumps({"error": "Ticket required"}))
    mt5.shutdown()
    sys.exit()

positions = mt5.positions_get(ticket=ticket)
if positions is None or len(positions) == 0:
    print(json.dumps({"error": "Position not found"}))
    mt5.shutdown()
    sys.exit()

pos = positions[0]
symbol = pos.symbol
volume = pos.volume
pos_type = pos.type

tick = mt5.symbol_info_tick(symbol)
if tick is None:
    print(json.dumps({"error": f"Cannot get tick for {symbol}"}))
    mt5.shutdown()
    sys.exit()

order_type = mt5.ORDER_TYPE_SELL if pos_type == 0 else mt5.ORDER_TYPE_BUY
price = tick.bid if pos_type == 0 else tick.ask

request = {
    "action": mt5.TRADE_ACTION_DEAL,
    "symbol": symbol,
    "volume": volume,
    "type": order_type,
    "price": price,
    "deviation": 100,
    "magic": 234000,
    "comment": "JournalFX close",
    "type_time": mt5.ORDER_TIME_GTC,
    "type_filling": mt5.ORDER_FILLING_FOK,
}

result = mt5.order_send(request)

if result.retcode != mt5.TRADE_RETCODE_DONE:
    print(json.dumps({
        "error": f"Close failed: {result.retcode}",
        "details": result.comment,
        "retcode_int": int(result.retcode)
    }))
else:
    print(json.dumps({
        "success": True,
        "ticket": ticket,
        "order": result.order,
        "volume": result.volume,
        "price": result.price,
        "closed": True
    }))

mt5.shutdown()