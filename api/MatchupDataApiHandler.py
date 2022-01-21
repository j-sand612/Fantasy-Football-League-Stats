from flask_restful import Api, Resource, reqparse
import requests as requests
import json as json
import pandas as pd
from datetime import date
import matplotlib.pyplot as plt
import numpy as np
from flask import request, current_app


class MatchupDataApiHandler(Resource):
    def get(self):
        current_year = date.today().year
        current_month = date.today().month
        league_id = int(request.args.get('leagueID'))
        year = int(request.args.get('year'))
        between_seasons = False
        if(current_year-1 == year and current_month < 9):
            between_seasons = True
        num_reg_season_wks = 13 if year < 2021 else 14

        if(year < current_year and not between_seasons):
            url = current_app.config["PAST_YEAR_ESPN_URL"] + \
                str(league_id) + "?seasonId=" + str(year)
        else:
            url = current_app.config["CURRENT_YEAR_ESPN_URL"] + \
                str(year) + "/segments/0/leagues/" + str(league_id)

        espn2_cookie = current_app.config['ESPN_COOKIE']
        swid_cookie = current_app.config['SWID_COOKIE']
        r = requests.get(url, cookies={"swid": swid_cookie,
                                       "espn_s2": espn2_cookie}, params={"view": "mMatchup"})

        r2 = requests.get(url, cookies={"swid": swid_cookie,
                                        "espn_s2": espn2_cookie})

        if(year < current_year and not between_seasons):
            d = r.json()[0]
            league_info = r2.json()[0]
        else:
            d = r.json()
            league_info = r2.json()

        # fill in bye week opponents
        for game in d['schedule']:
            if not 'away' in game:
                game['away'] = {'teamId': 'BYE', 'totalPoints': 0}

        league_df = [[
            team['id'], (team['location'] + " " + team['nickname'])
        ] for team in league_info['teams']]

        league_df = pd.DataFrame(league_df, columns=['ID', 'name'])
        league_df = league_df.astype({"ID": str})

        matchup_df = [[
            game['matchupPeriodId'],
            game['home']['teamId'], game['home']['totalPoints'],
            game['away']['teamId'], game['away']['totalPoints']
        ] for game in d['schedule']]
        matchup_df = pd.DataFrame(
            matchup_df, columns=['Week', 'Team1', 'Score1', 'Team2', 'Score2'])
        matchup_df['Type'] = ['Regular' if w <=
                              num_reg_season_wks else 'Playoff' for w in matchup_df['Week']]
        matchup_df = matchup_df.astype({"Team1": str})
        matchup_df = matchup_df.astype({"Team2": str})
        matchup_df['Team1Name'] = matchup_df['Team1'].map(
            league_df.set_index('ID')['name'])
        matchup_df['Team2Name'] = matchup_df['Team2'].map(
            league_df.set_index('ID')['name'])
        matchup_df['key'] = matchup_df.index
        matchup_df.set_index('key')

        json_data = matchup_df.to_json(orient='records')
        return json.loads(json_data)
