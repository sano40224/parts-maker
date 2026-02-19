from flask import Blueprint, request, jsonify , json
from flask_login import login_required, current_user
from models import db, Post, Like
from extensions import db
from datetime import datetime

posts_bp = Blueprint('posts', __name__)


@posts_bp.route('/', methods=['GET'])
def get_posts():
    posts = Post.query.filter(Post.is_delete == None).order_by(Post.created_at.desc()).all()
    # ログインしていればIDを渡して判定させる
    uid = current_user.UserId if current_user.is_authenticated else None
    return jsonify([post.to_dict(current_user_id=uid) for post in posts])

@posts_bp.route('/my', methods=['GET'])
@login_required
def get_my_posts():
    # 自分のIDで、かつ is_delete が NULL のものを取得
    posts = Post.query.filter_by(UserId=current_user.UserId, is_delete=None).order_by(Post.created_at.desc()).all()
    return jsonify([post.to_dict(current_user_id=current_user.UserId) for post in posts])




@posts_bp.route('/', methods=['POST'])
@login_required
def create_post():
    data = request.get_json()

    title = data.get('title')  # PostTextに入る
    html_code = data.get('html_code')
    css_code = data.get('css_code')
    setting = data.get('setting')
    if isinstance(setting, (list, dict)):
        setting = json.dumps(setting)
    original_author = data.get('original_author')
    thumbnail_data = data.get('thumbnail')

    if not title:
        return jsonify({"message": "タイトルは必須です"}), 400

    new_post = Post(
        PostText=title,
        HtmlCode=html_code,
        CssCode=css_code,
        Setting=setting,  #  DBのSettingカラムに保存
        user=current_user,
        original_author=original_author,
        ThumbnailData=thumbnail_data,
    )
    db.session.add(new_post)
    db.session.commit()

    return jsonify({"message": "投稿を作成しました", "post": new_post.to_dict()}), 201


#既存の投稿を更新 (上書き保存)
@posts_bp.route('/<int:post_id>', methods=['PUT'])
@login_required
def update_post(post_id):
    post = Post.query.get_or_404(post_id)

    # 本人確認
    if post.UserId != current_user.UserId:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json

    # データを更新
    post.PostText = data['title']
    post.HtmlCode = data['html_code']
    post.CssCode = data['css_code']
    post.Setting = json.dumps(data['setting'])
    post.ThumbnailData = data.get('thumbnail')  # サムネも更新

    post.updated_at = datetime.utcnow()  # 更新日時

    db.session.commit()
    return jsonify(post.to_dict()), 200


# 論理削除 (ゴミ箱ボタン)
@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)

    # 本人確認
    if post.UserId != current_user.UserId:
        return jsonify({"error": "Unauthorized"}), 403

    # 論理削除: データを消さずに、削除日時を入れる
    post.is_delete = datetime.utcnow()

    db.session.commit()
    return jsonify({"message": "Deleted successfully"}), 200

# ---  いいね切替機能 ---
@posts_bp.route('/<int:post_id>/like', methods=['POST'])
@login_required
def toggle_like(post_id):
    post = Post.query.get_or_404(post_id)
    existing_like = Like.query.filter_by(UserId=current_user.UserId, PostId=post_id).first()

    if existing_like:
        # 既にいいね済み -> 解除
        db.session.delete(existing_like)
        post.like_count = max(0, post.like_count - 1)
        action = 'unliked'
    else:
        # まだ -> いいね登録
        new_like = Like(UserId=current_user.UserId, PostId=post_id)
        db.session.add(new_like)
        post.like_count += 1
        action = 'liked'

    db.session.commit()
    return jsonify({"message": "Success", "action": action, "like_count": post.like_count})

# ---  いいねした投稿一覧 ---
@posts_bp.route('/liked', methods=['GET'])
@login_required
def get_liked_posts():
    liked_posts = db.session.query(Post).join(Like).filter(Like.UserId == current_user.UserId,Post.is_delete == None).order_by(Like.created_at.desc()).all()
    return jsonify([post.to_dict(current_user_id=current_user.UserId) for post in liked_posts])

# フォーク数を増やすAPI
@posts_bp.route('/<int:post_id>/fork', methods=['POST'])
@login_required
def increment_fork(post_id):
    post = Post.query.get_or_404(post_id)
    post.fork_count += 1
    db.session.commit()
    return jsonify({"message": "Fork count updated", "fork_count": post.fork_count})