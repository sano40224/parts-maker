from flask import Flask, jsonify
from flask_cors import CORS


def create_app():
    app = Flask(__name__)

    # React (http://localhost:5173) からのアクセスを許可する設定
    CORS(app)

    # テスト用のAPIエンドポイント
    # Reactからこの URL (/api/hello) にアクセスが来たら返事をします
    @app.route('/api/hello', methods=['GET'])
    def hello():
        return jsonify({"message": "成功！FlaskとReactが繋がっています！"})

    return app