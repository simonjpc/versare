from flask import Flask, jsonify, request, send_from_directory
import os
from retrieval import get_most_similar_chunks
from generation import generate_answer

from flask_cors import CORS


app = Flask(__name__)

CORS(app)
BASE_DIR = "/Users/simon/Documents/perso/repos/versare/test_folders"  # Replace this with the path to the directory you want to serve


@app.route("/files", methods=["GET"])
def list_files():
    folder_structure = []
    for foldername, subfolders, filenames in os.walk(BASE_DIR):
        relative_path = os.path.relpath(foldername, BASE_DIR)
        filenames = [fn for fn in filenames if fn != ".DS_Store"]
        folder = {"name": relative_path, "documents": filenames}
        folder_structure.append(folder)
    return jsonify(folder_structure)


@app.route("/file", methods=["GET"])
def get_file():
    file_path = request.args.get("path")
    if not file_path or ".." in file_path:
        return "Invalid file path", 400
    with open(os.path.join(BASE_DIR, file_path), "r") as file:
        content = file.read()
    return jsonify({"content": content})


@app.route("/file", methods=["POST"])
def save_file():
    data = request.json
    file_path = data.get("path")
    content = data.get("content")
    if not file_path or ".." in file_path:
        return "Invalid file path", 400
    with open(os.path.join(BASE_DIR, file_path), "w") as file:
        file.write(content)
    return "File saved successfully", 200


@app.route("/api/call", methods=["POST"])
def api_call():
    data = request.json
    text = data.get("text")
    highlighted_text = data.get("highlightedText")
    # send text to api call and get response
    print("text:\n", text)
    print("highlighted_text:\n", highlighted_text)
    context = get_most_similar_chunks(text)
    answer = generate_answer(highlighted_text, context)
    return jsonify({"content": answer})


if __name__ == "__main__":
    app.run(debug=True)
