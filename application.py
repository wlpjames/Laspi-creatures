from flask import Flask, flash, redirect, render_template, request, session, jsonify
from flask_session import Session
from tempfile import mkdtemp
from subprocess import Popen, PIPE
from cs50 import SQL
import random
import json
from creature import *

# Configure application
app = Flask(__name__)

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
#db = SQL("sqlite:///sudoku.db")

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        return render_template("index.html")

    else:
       return render_template("index.html")

@app.route("/spawn")
def spawn():
    """creates new minds, returns jsonified"""
    if not request.args.get("inputs"):
        return
    else:
        inputs = int(request.args.get("inputs"))
        outputs = int(request.args.get("outputs"))
    arr = request_brain(inputs, outputs)
    #print(arr[3])

    return jsonify(arr)

@app.route("/mutate")
def mutate():
    """mutates mind, returns jsonified"""
    id = request.args.get("id")
    print("id === " + id)
    id = int(id)
    arr = request_child(id);
    #concatinate browser index
    arr.append(int(request.args.get("Index")));

    return jsonify(arr)

@app.route("/indroduce")
def introduce():
    """introduces mind/minds from DB, returns jsonified"""

@app.route("/data")
def data():
    """collates data from browser and stoors in DB"""








