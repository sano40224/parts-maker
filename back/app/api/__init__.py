from flask import Flask
from back.app.config import (Config)
from back.app.extensions import db, migrate, cors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 拡張機能の初期化
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app) # Reactからのアクセスを許可

    # API(Blueprint)の登録
    from .api import auth, parts
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(parts.bp, url_prefix='/api/parts')

    return app