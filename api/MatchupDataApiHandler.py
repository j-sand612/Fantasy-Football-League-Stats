from flask_restful import Api, Resource, reqparse
import requests as requests
import json as json
import pandas as pd
from datetime import date
import matplotlib.pyplot as plt
import numpy as np
from flask import request


class MatchupDataApiHandler(Resource):
    def get(self):
        current_year = date.today().year
        league_id = int(request.args.get('leagueID'))
        year = int(request.args.get('year'))
        num_reg_season_wks = 13 if year<2021 else 14

        if(year < current_year):
            url = "https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/" + \
            str(league_id) + "?seasonId=" + str(year)
        else:
            url = "https://fantasy.espn.com/apis/v3/games/ffl/seasons/" + str(year) + "/segments/0/leagues/" + str(league_id)


        espn2_cookie = "AEAxEeNKrB88Vp%2FpTId5L7gZR6msXtExYPnpimar0j9jiEy5N1tEyWbRFMEyLMx7CrbRswiETXU1rI7CCHOrjLskyOIDdkJyD%2BolbOsW8BsZb3Ej9t5%2BoQ4hXkMZ3n%2FxcFhQuLt3ZHqwxUWA52VYtSZ91UPr5xUS%2BiB47vgiX41KFWKVrCIFZg286Kqot8kkkbW270WrWpyuA5CiaTo86QfHqGnLA1ZQh9TqrDJP9SBhrHtPpbg9cCbczXj8Faw7ww6tluoT8GVxPCOmLTzICmI2"    
        swid_cookie = "{3845AF95-060B-4A9B-9E60-F16218937970}"  
        r = requests.get(url, cookies={"swid": swid_cookie,
                          "espn_s2": espn2_cookie}, params={"view": "mMatchup"})

        r2 = requests.get(url, cookies={"swid": swid_cookie,
                                "espn_s2": espn2_cookie})

        if(year<current_year):
            d = r.json()[0]
            league_info = r2.json()[0]
        else:
            d = r.json()
            league_info = r2.json()
            
            
        #fill in bye week opponents
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
        matchup_df = pd.DataFrame(matchup_df, columns=['Week', 'Team1', 'Score1', 'Team2', 'Score2'])
        matchup_df['Type'] = ['Regular' if w<=num_reg_season_wks else 'Playoff' for w in matchup_df['Week']]
        matchup_df = matchup_df.astype({"Team1": str})
        matchup_df = matchup_df.astype({"Team2": str})
        matchup_df['Team1Name'] =  matchup_df['Team1'].map(league_df.set_index('ID')['name'])
        matchup_df['Team2Name'] =  matchup_df['Team2'].map(league_df.set_index('ID')['name'])
        matchup_df['key'] = matchup_df.index
        matchup_df.set_index('key')
        

        json_data = matchup_df.to_json(orient='records')
        return json.loads(json_data)

    def post(self):
        print(self)
        parser = reqparse.RequestParser()
        parser.add_argument('type', type=str)
        parser.add_argument('message', type=str)

        args = parser.parse_args()

        print(args)
        # note, the post req from frontend needs to match the strings here (e.g. 'type and 'message')

        request_type = args['type']
        request_json = args['message']
        # ret_status, ret_msg = ReturnData(request_type, request_json)
        # currently just returning the req straight
        ret_status = request_type
        ret_msg = request_json

        if ret_msg:
            message = "Your Message Requested: {}".format(ret_msg)
        else:
            message = "No Msg"

        final_ret = {"status": "Success", "message": message}

        return final_ret
