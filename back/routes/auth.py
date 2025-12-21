from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from models import User
from extensions import db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # フロントエンドからは小文字(username, email)で来る想定ですが、
    # DBのカラム名は大文字(UserName, MailAddress)です。
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # 重複チェック (UserName または MailAddress)
    if User.query.filter((User.UserName == username) | (User.MailAddress == email)).first():
        return jsonify({"message": "ユーザー名またはメールアドレスが既に使用されています"}), 400

    # 新しいユーザーを作成
    new_user = User(UserName=username, MailAddress=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    login_user(new_user)
    return jsonify({"message": "登録成功", "user": new_user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # ユーザー名またはメールアドレスでログインできるようにする場合
    login_id = data.get('username')  # フロント側のinput name="username" を受け取る
    password = data.get('password')

    # UserNameまたはMailAddressで検索
    user = User.query.filter((User.UserName == login_id) | (User.MailAddress == login_id)).first()

    if user and user.check_password(password):
        login_user(user)
        return jsonify({"message": "ログイン成功", "user": user.to_dict()}), 200

    return jsonify({"message": "IDまたはパスワードが間違っています"}), 401


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "ログアウトしました"}), 200


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({"is_authenticated": True, "user": current_user.to_dict()})
    else:
        return jsonify({"is_authenticated": False, "user": None})