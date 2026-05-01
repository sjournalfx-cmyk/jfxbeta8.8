import MetaTrader5 as mt5
import json
import sys
import os

CONN_FILE = os.path.join(os.path.dirname(__file__), '.mt5_conn')

def connect():
    if not mt5.initialize():
        return False
    with open(CONN_FILE, 'w') as f:
        f.write('connected')
    return True

if os.path.exists(CONN_FILE):
    if not mt5.initialize():
        sys.stdout.write(json.dumps({"error": str(mt5.last_error())}))
        sys.exit()

    account = mt5.account_info()
    if account is None:
        sys.stdout.write(json.dumps({"error": "Not connected"}))
        sys.exit()
    
    symbol = sys.argv[1] if len(sys.argv) > 1 else None
    volume = float(sys.argv[2]) if len(sys.argv) > 2 else 0.01
    direction = sys.argv[3].upper() if len(sys.argv) > 3 else "BUY"
    sl = float(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] != "0" else 0
    tp = float(sys.argv[5]) if len(sys.argv) > 5 and sys.argv[5] != "0" else 0

    if not symbol:
        print(json.dumps({"error": "Symbol required"}))
        sys.exit()

    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        print(json.dumps({"error": f"Symbol {symbol} not found"}))
        sys.exit()

    if not symbol_info.visible:
        mt5.symbol_select(symbol, True)

    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        print(json.dumps({"error": f"Cannot get tick for {symbol}"}))
        sys.exit()

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": volume,
        "type": mt5.ORDER_TYPE_BUY if direction == "BUY" else mt5.ORDER_TYPE_SELL,
        "price": tick.ask if direction == "BUY" else tick.bid,
        "deviation": 100,
        "magic": 234000,
        "comment": "JournalFX",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_FOK,
    }

    if sl > 0:
        request["sl"] = sl
    if tp > 0:
        request["tp"] = tp

    result = mt5.order_send(request)

    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(json.dumps({
            "error": f"Order failed: {result.retcode}",
            "details": result.comment
        }))
    else:
        print(json.dumps({
            "success": True,
            "order": result.order,
            "price": result.price,
            "volume": result.volume
        }))
else:
    print(json.dumps({"success": True, "connected": True}))