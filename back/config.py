import os


class Config:
    SECRET_KEY = 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:root@localhost/parts_maker_db?charset=utf8'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_SECURE = True