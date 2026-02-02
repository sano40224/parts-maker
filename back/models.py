from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from datetime import datetime
from sqlalchemy.dialects.mysql import LONGTEXT


# --- t_user (ユーザーテーブル) ---
class User(UserMixin, db.Model):
    __tablename__ = 't_user'

    UserId = db.Column(db.Integer, primary_key=True)
    UserName = db.Column(db.String(50), nullable=False)
    MailAddress = db.Column(db.String(255), unique=True, nullable=False)
    Password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    # リレーション
    posts = db.relationship('Post', backref='user', lazy=True)

    # Flask-Login用: idプロパティがUserIdを返すようにオーバーライド
    def get_id(self):
        return str(self.UserId)

    def set_password(self, password):
        self.Password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.Password, password)

    def to_dict(self):
        return {
            "UserId": self.UserId,
            "UserName": self.UserName,
            "MailAddress": self.MailAddress
        }


# --- t_category (カテゴリテーブル) ---
class Category(db.Model):
    __tablename__ = 't_category'

    CategoryId = db.Column(db.Integer, primary_key=True)
    CategoryName = db.Column(db.String(50), nullable=False)



# --- t_post (投稿テーブル) ---
class Post(db.Model):
    __tablename__ = 't_post'

    PostId = db.Column(db.Integer, primary_key=True)
    UserId = db.Column(db.Integer, db.ForeignKey('t_user.UserId'), nullable=False)
    CategoryId = db.Column(db.Integer, db.ForeignKey('t_category.CategoryId'), nullable=True)

    PostText = db.Column(db.String(255))  # タイトルや説明文として使用
    Setting = db.Column(db.JSON, nullable=True)  # JSON設定
    HtmlCode = db.Column(db.Text, nullable=True)
    CssCode = db.Column(db.Text, nullable=True)

    is_delete = db.Column(db.DateTime, nullable=True)  # 削除日時 (論理削除用)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    like_count = db.Column(db.Integer, default=0)
    fork_count = db.Column(db.Integer, default=0)
    original_author = db.Column(db.String(255), nullable=True)

    ThumbnailData = db.Column(LONGTEXT, nullable=True)

    likes = db.relationship('Like', backref='post', lazy='dynamic')

    def to_dict(self, current_user_id=None):
        is_liked = False
        if current_user_id:
            # 自分がこの投稿をいいねしているか確認
            is_liked = db.session.query(Like).filter_by(
                UserId=current_user_id,
                PostId=self.PostId
            ).first() is not None
        return {
            "PostId": self.PostId,
            "PostText": self.PostText,
            "HtmlCode": self.HtmlCode,
            "CssCode": self.CssCode,
            "author": self.user.UserName if self.user else "Unknown",
            "like_count": self.like_count,
            "fork_count": self.fork_count,
            "created_at": self.created_at,
            "setting": self.Setting,
            "author_id": self.UserId,
            "thumbnail": self.ThumbnailData,
            "original_author": self.original_author,
            "is_liked": is_liked
        }


# --- t_like (いいねテーブル) ---
class Like(db.Model):
    __tablename__ = 't_like'

    LikeId = db.Column(db.Integer, primary_key=True)
    UserId = db.Column(db.Integer, db.ForeignKey('t_user.UserId'), nullable=False)
    PostId = db.Column(db.Integer, db.ForeignKey('t_post.PostId'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)


# --- t_favorite (お気に入りテーブル) ---
class Favorite(db.Model):
    __tablename__ = 't_favorite'

    FavoriteId = db.Column(db.Integer, primary_key=True)
    UserId = db.Column(db.Integer, db.ForeignKey('t_user.UserId'), nullable=False)
    PostId = db.Column(db.Integer, db.ForeignKey('t_post.PostId'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)


# --- t_comment (コメントテーブル) ---
class Comment(db.Model):
    __tablename__ = 't_comment'

    CommentId = db.Column(db.Integer, primary_key=True)
    UserId = db.Column(db.Integer, db.ForeignKey('t_user.UserId'), nullable=False)
    PostId = db.Column(db.Integer, db.ForeignKey('t_post.PostId'), nullable=False)
    CommentText = db.Column(db.String(255), nullable=False)
    delete = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)


# --- t_follow (フォローテーブル) ---
class Follow(db.Model):
    __tablename__ = 't_follow'

    FollowId = db.Column(db.Integer, primary_key=True)
    FollowerId = db.Column(db.Integer, db.ForeignKey('t_user.UserId'), nullable=False)
    FollowedId = db.Column(db.Integer, db.ForeignKey('t_user.UserId'), nullable=False)