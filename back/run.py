from app import create_app

app = create_app()

if __name__ == '__main__':
    # debug=True にすると、コードを変更した時に自動で再起動してくれます
    app.run(debug=True, port=5000)