from flask import Blueprint, request, jsonify
from ..models.part import Part
from ..extensions import db

bp = Blueprint('parts', __name__)

# パーツ保存 API
@bp.route('/save', methods=['POST'])
def save_part():
    data = request.json
    # フロントから送られてきた data['settings'] をDBに保存する処理...
    return jsonify({"message": "Saved successfully!"}), 201