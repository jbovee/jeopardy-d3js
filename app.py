from flask import Flask, render_template, jsonify, request
from get_seasons import get_all_seasons, get_season, get_season_range
import os, re

app = Flask(__name__, template_folder='')

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/season")
def season_data():
	seasonNo = request.args.get('no')
	return jsonify(get_season(seasonNo))

@app.route("/seasons")
def season_range():
	s, e = request.args.get('s'), request.args.get('e')
	return jsonify(get_season_range(s,e))

@app.route("/all-seasons")
def all_season_data():
	return jsonify(get_all_seasons())

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=5000, debug=True)