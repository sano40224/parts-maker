import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from extensions import db, login_manager
from models import User
import cloudinary
import cloudinary.uploader

# Blueprintのインポート
from routes.auth import auth_bp
from routes.posts import posts_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 初期化
    db.init_app(app)
    login_manager.init_app(app)

    CORS(app, supports_credentials=True, origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://parts-maker.vercel.app",
    ])

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')

    with app.app_context():
        db.create_all()

    return app

app = create_app()


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Cloudinaryの初期設定
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# ▼ appが作られた後なので、@app.route が正しく使える
@app.route('/api/upload', methods=['POST'])
def upload_image():
    # 送られてきたファイルを取得
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        # Cloudinaryに画像を送信・保存
        upload_result = cloudinary.uploader.upload(file)

        # 保存された画像のURL (https://...) を取得
        image_url = upload_result.get("secure_url")

        # フロントエンドにURLを返す
        return jsonify({"url": image_url}), 200

    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({"error": "Upload failed"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)