from flask import Flask, render_template, request, redirect, url_for, jsonify
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
tasks = (
    {}
)  # Store tasks as {task_id: {"description": "Task Description", "completed": False}}


@app.route("/", methods=["GET"])
def home():
    return render_template("home.html", tasks=tasks)


@app.route("/add", methods=["POST"])
def add_task():
    task_content = request.json.get("task")
    if task_content:
        task_id = max(tasks.keys(), default=0) + 1
        tasks[task_id] = {"description": task_content, "completed": False}
    return jsonify(tasks=tasks)


@app.route("/edit/<int:task_id>", methods=["POST"])
def edit_task(task_id):
    new_task_content = request.json.get("edit_task")
    if new_task_content and task_id in tasks:
        tasks[task_id]["description"] = new_task_content
    return jsonify(tasks=tasks)


@app.route("/delete/<int:task_id>", methods=["POST"])
def delete_task(task_id):
    tasks.pop(task_id, None)
    return jsonify(tasks=tasks)


@app.route("/complete/<int:task_id>", methods=["POST"])
def complete_task(task_id):
    if task_id in tasks:
        tasks[task_id]["completed"] = True
    return jsonify(tasks=tasks)


@app.route("/incomplete/<int:task_id>", methods=["POST"])
def mark_as_incomplete(task_id):
    if task_id in tasks:
        tasks[task_id]["completed"] = False
    return jsonify(tasks=tasks)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
