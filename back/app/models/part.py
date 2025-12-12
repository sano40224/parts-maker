from ..extensions import db
from datetime import datetime


class Part(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # パーツ名

    # ★ここが重要: フロントのsettings JSONを丸ごと保存
    settings = db.Column(db.JSON, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 誰が作ったか (Userテーブルとの紐づけ)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'settings': self.settings,
            'created_at': self.created_at
        }