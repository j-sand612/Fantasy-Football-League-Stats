
from flask import Flask, send_from_directory
from flask_restful import Api, Resource, reqparse
# from flask_cors import CORS  # comment this on deployment
from api.MatchupDataApiHandler import MatchupDataApiHandler
from api.StandingsApiHandler import StandingsApiHandler
from api.CurrentStandingsApiHandler import CurrentStandingsApiHandler
import json

app = Flask(__name__, static_url_path='', static_folder='frontend/build', template_folder='./frontend/public')
app.config.from_file("./api/config/config.json", load=json.load)
# CORS(app)  # comment this on deployment
api = Api(app)


@app.route("/", defaults={'path': ''})
def serve(path):
    return send_from_directory(app.static_folder, 'index.html')


api.add_resource(MatchupDataApiHandler, '/flask/Matchup/all')
api.add_resource(StandingsApiHandler, '/flask/Standings')
api.add_resource(CurrentStandingsApiHandler, '/flask/CurrentStandings')

