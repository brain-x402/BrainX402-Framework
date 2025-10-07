import json
from flask import Flask, request

app = Flask(__name__)

@app.route("/transaction", methods=["POST"])
def handle_transaction():
    data = json.loads(request.data)
    return {"status": "success", "tx": data.get("tx_hash")}

if __name__ == "__main__":
    app.run(port=8000)
