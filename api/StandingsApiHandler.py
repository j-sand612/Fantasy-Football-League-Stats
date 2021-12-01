from flask_restful import Api, Resource, reqparse
import requests as requests
import json as json
import pandas as pd
from datetime import date
import matplotlib.pyplot as plt
import numpy as np
from flask import request, current_app

class StandingsApiHandler(Resource):
    def get(self):
        current_year = date.today().year
        league_id = int(request.args.get('leagueID'))
        year = int(request.args.get('year'))
        num_reg_season_wks = 13 if year<2021 else 14

        if(year < current_year):
            url = current_app.config["PAST_YEAR_ESPN_URL"] + \
            str(league_id) + "?seasonId=" + str(year)
        else:
            url = current_app.config["CURRENT_YEAR_ESPN_URL"] + str(year) + "/segments/0/leagues/" + str(league_id)


        espn2_cookie = current_app.config['ESPN_COOKIE'] 
        swid_cookie =  current_app.config['SWID_COOKIE']
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
        
        league_df['Total Points'] = ""
        league_df['Total Playoff Points'] = ""
        for id in league_df['ID']:
            team_total = matchup_df[(matchup_df['Team1']==id) & (matchup_df['Type']=='Regular')].sum()['Score1'] + matchup_df[(matchup_df['Team2']==id) & (matchup_df['Type']=='Regular')].sum()['Score2']
            playoff_team_total = matchup_df[(matchup_df['Team1']==id) & (matchup_df['Type']=='Playoff')].sum()['Score1'] + matchup_df[(matchup_df['Team2']==id) & (matchup_df['Type']=='Playoff')].sum()['Score2']
            league_df.loc[league_df['ID']==id, ['Total Points']] = team_total
            league_df.loc[league_df['ID']==id, ['Total Playoff Points']] = playoff_team_total
            
        league_df['Wins'] = 0
        league_df['Losses'] = 0
        league_df['Points For'] = 0
        league_df['Points Against'] = 0
        
        if year < 2021:
            standings_df = pd.DataFrame(columns=['Team','Week 1','Week 2','Week 3','Week 4','Week 5','Week 6','Week 7','Week 8','Week 9','Week 10','Week 11','Week 12','Week 13',])
        else:
            standings_df = pd.DataFrame(columns=['Team','Week 1','Week 2','Week 3','Week 4','Week 5','Week 6','Week 7','Week 8','Week 9','Week 10','Week 11','Week 12','Week 13','Week 14',])

        standings_df['Team'] = league_df['name']  
        curWeek = 1
        found_final_week = False
        final_week = 99
        for index, row in matchup_df.iterrows():    
            
            #calculate rank after last weeks results
            if curWeek < row['Week'] and row['Week'] <= num_reg_season_wks + 1 and not found_final_week:
                    sorted_df = league_df.sort_values(['Wins', 'Points For'], ascending=[False, False])
                    rank = 1
                    week_name = 'Week ' + str(curWeek)
                    print(week_name)
                    for index, s_row in sorted_df.iterrows():
                        standings_df.loc[standings_df['Team'] == s_row['name'], [week_name]] = rank
                        rank += 1
                    curWeek = row['Week']
            
            #calculate week's results
            if row['Week'] <= num_reg_season_wks:    
                league_df.loc[league_df['name'] == row['Team1Name'], ['Points For']] += row['Score1']
                league_df.loc[league_df['name'] == row['Team2Name'], ['Points For']] += row['Score2']
                league_df.loc[league_df['name'] == row['Team1Name'], ['Points Against']] += row['Score2']
                league_df.loc[league_df['name'] == row['Team2Name'], ['Points Against']] += row['Score1']
                if row['Score1'] > row['Score2']:
                    league_df.loc[league_df['name'] == row['Team1Name'], ['Wins']] += 1
                    league_df.loc[league_df['name'] == row['Team2Name'], ['Losses']] += 1
                if row['Score2'] > row['Score1']:
                    league_df.loc[league_df['name'] == row['Team2Name'], ['Wins']] += 1
                    league_df.loc[league_df['name'] == row['Team1Name'], ['Losses']] += 1
                if row['Score1'] == 0 and row['Score2'] == 0 and not found_final_week:
                    final_week = row['Week']
                    found_final_week = True
                    
            
        if year == current_year and not found_final_week:
            sorted_df = league_df.sort_values(['Wins', 'Points For'], ascending=[False, False])
            rank = 1
            week_name = 'Week ' + str(curWeek)
            for index, s_row in sorted_df.iterrows():
                standings_df.loc[standings_df['Team'] == s_row['name'], [week_name]] = rank
                rank += 1
            curWeek = row['Week']
        standings_df.set_index('Team')
        json_data = standings_df.to_json(orient='records')
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