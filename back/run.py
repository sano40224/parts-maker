from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, login_manager
from models import User

# Blueprintのインポート
from routes.auth import auth_bp
from routes.posts import posts_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 初期化
    db.init_app(app)
    login_manager.init_app(app)

    # CORS設定: React(localhost:3000)からのリクエストを許可し、Cookie(credentials)を通す
    CORS(app)
    # Blueprintの登録 (URLの接頭辞をつける)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')

    with app.app_context():
        db.create_all()

    return app

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)