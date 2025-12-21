from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import Post
from extensions import db

posts_bp = Blueprint('posts', __name__)


@posts_bp.route('/', methods=['GET'])
def get_posts():
    posts = Post.query.filter_by(is_delete=None).all()  # 削除されていないものを取得
    return jsonify([post.to_dict() for post in posts]), 200


@posts_bp.route('/', methods=['POST'])
@login_required
def create_post():
    data = request.get_json()

    # フロントエンドからのデータを受け取る
    title = data.get('title')  # これを PostText に入れる
    html_code = data.get('html_code')
    css_code = data.get('css_code')

    if not title:
        return jsonify({"message": "タイトルは必須です"}), 400

    new_post = Post(
        PostText=title,
        HtmlCode=html_code,
        CssCode=css_code,
        user=current_user
    )
    db.session.add(new_post)
    db.session.commit()

    return jsonify({"message": "投稿を作成しました", "post": new_post.to_dict()}), 201